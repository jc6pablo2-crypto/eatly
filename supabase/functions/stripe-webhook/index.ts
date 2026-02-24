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

    // --- CHECKOUT COMPLETED (first payment) ---
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerId = session.customer as string
      const userId = session.client_reference_id as string

      // Try to update by customer_id first (most reliable)
      if (customerId) {
        const { error } = await adminSupabase
          .from('profiles')
          .update({ is_premium: true, stripe_customer_id: customerId })
          .eq('stripe_customer_id', customerId)

        if (error) console.error('Update by customer_id failed:', error.message)
        else console.log(`✅ User marked premium via customer_id: ${customerId}`)
      }

      // Also update by user_id as fallback (from client_reference_id)
      if (userId) {
        const { error } = await adminSupabase
          .from('profiles')
          .update({ is_premium: true, stripe_customer_id: customerId || undefined })
          .eq('user_id', userId)

        if (error) console.error('Update by user_id failed:', error.message)
        else console.log(`✅ User marked premium via user_id: ${userId}`)
      }
    }

    // --- SUBSCRIPTION RENEWED (recurring payment success) ---
    else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      if (customerId && invoice.billing_reason === 'subscription_cycle') {
        await adminSupabase
          .from('profiles')
          .update({ is_premium: true })
          .eq('stripe_customer_id', customerId)

        console.log(`✅ Subscription renewed for customer: ${customerId}`)
      }
    }

    // --- SUBSCRIPTION CANCELLED ---
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      if (customerId) {
        await adminSupabase
          .from('profiles')
          .update({ is_premium: false })
          .eq('stripe_customer_id', customerId)

        console.log(`❌ Subscription cancelled for customer: ${customerId}`)
      }
    }

    // --- PAYMENT FAILED (subscription at risk) ---
    else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      if (customerId) {
        console.warn(`⚠️ Payment failed for customer: ${customerId}`)
        // Optionally mark user as past_due but still allow access for a grace period
        // For now, don't revoke access immediately
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })

  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(JSON.stringify({ error: 'Webhook Error', details: err.message }), { status: 400 })
  }
})
