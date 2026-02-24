import Stripe from 'stripe';
import 'dotenv/config';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setup() {
    try {
        // 1. Create Product
        console.log("Creating product...");
        const product = await stripe.products.create({
            name: 'Eatly Premium',
            description: 'Débloquez toutes les fonctionnalités avancées, historique complet et conseils IA',
        });

        // 2. Create Price
        console.log("Creating price...");
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 1200,
            currency: 'eur',
            recurring: { interval: 'month' },
        });
        console.log(`PRICE_ID=${price.id}`);

        // 3. Create Webhook
        console.log("Creating webhook...");
        const webhook = await stripe.webhookEndpoints.create({
            url: 'https://okvemteinuvwmemnfiog.supabase.co/functions/v1/stripe-webhook',
            enabled_events: [
                'checkout.session.completed',
                'customer.subscription.deleted',
            ],
        });
        console.log(`WEBHOOK_SECRET=${webhook.secret}`);

    } catch (err) {
        console.error("Error setting up Stripe:", err);
    }
}

setup();
