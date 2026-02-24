import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.14.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req: Request) => {
  const signature = req.headers.get("Stripe-Signature")
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: "No signature or webhook secret" }), { status: 400 })
  }

  try {
    const body = await req.text()

    // Verify Stripe signature
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
    } catch (err: any) {
      console.error(`Webhook signature verification failed.`, err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 400 });
    }

    const adminSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Received event type: ${event.type}`)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerId = session.customer as string

      if (customerId) {
        // Mark user as premium
        await adminSupabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('stripe_customer_id', customerId)
      }
    }
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      if (customerId) {
        // Revert user to free
        await adminSupabase
          .from('profiles')
          .update({ is_premium: false })
          .eq('stripe_customer_id', customerId)
      }
    }
    // Stripe optionally fires 'customer.subscription.updated', we could handle past_due here too.

    return new Response(JSON.stringify({ received: true }), { status: 200 })

  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(JSON.stringify({ error: 'Webhook Error', details: err.message }), { status: 400 })
  }
})
