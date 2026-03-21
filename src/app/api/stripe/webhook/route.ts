import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role client for webhook — no user session available
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Map price IDs to plans
function planFromPrice(priceId: string): string | null {
  if (priceId === process.env.STRIPE_PRICE_SHORTLIST) return 'shortlist';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ELITE) return 'elite';
  // Legacy price ID
  if (priceId === process.env.STRIPE_PRICE_ID) return 'pro';
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const plan = session.metadata?.plan || 'pro';
        const saleId = session.metadata?.sale_id || '';

        if (!userId) break;

        if (plan === 'shortlist') {
          // One-time purchase: 25 credits for a specific sale
          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'shortlist',
              credits_remaining: 25,
              credit_sale_id: saleId,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log(`User ${userId} purchased Short List for ${saleId}`);
        } else if (session.mode === 'subscription') {
          // Pro or Elite subscription
          await supabaseAdmin
            .from('profiles')
            .update({
              plan,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log(`User ${userId} upgraded to ${plan}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              plan: 'free',
              credits_remaining: 0,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          console.log(`User ${profile.id} downgraded to free (subscription canceled)`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;
        const newPlan = priceId ? planFromPrice(priceId) : null;

        if (subscription.status === 'active' && newPlan) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({ plan: newPlan, updated_at: new Date().toISOString() })
              .eq('id', profile.id);
            console.log(`User ${profile.id} subscription updated to ${newPlan}`);
          }
        } else if (['past_due', 'unpaid', 'canceled'].includes(subscription.status)) {
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (profile) {
            await supabaseAdmin
              .from('profiles')
              .update({ plan: 'free', credits_remaining: 0, updated_at: new Date().toISOString() })
              .eq('id', profile.id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        console.log(`Payment failed for customer ${customerId}`);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
