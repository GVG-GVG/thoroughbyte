import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

const PLAN_PRICES: Record<string, { priceId: string; mode: 'payment' | 'subscription' }> = {
  shortlist: { priceId: process.env.STRIPE_PRICE_SHORTLIST!, mode: 'payment' },
  pro:       { priceId: process.env.STRIPE_PRICE_PRO!, mode: 'subscription' },
  elite:     { priceId: process.env.STRIPE_PRICE_ELITE!, mode: 'subscription' },
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedPlan = body.plan as string;
    const saleId = body.saleId as string | undefined;

    if (!requestedPlan || !PLAN_PRICES[requestedPlan]) {
      return NextResponse.json({ error: 'Invalid plan. Choose shortlist, pro, or elite.' }, { status: 400 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    // Prevent downgrade or same-plan purchase (for subscriptions)
    const planRank: Record<string, number> = { free: 0, shortlist: 1, pro: 2, elite: 3 };
    const currentRank = planRank[profile?.plan ?? 'free'] ?? 0;
    const requestedRank = planRank[requestedPlan] ?? 0;

    if (requestedPlan !== 'shortlist' && requestedRank <= currentRank) {
      return NextResponse.json({ error: `Already on ${profile?.plan} plan` }, { status: 400 });
    }

    // Short List requires a sale selection
    if (requestedPlan === 'shortlist' && !saleId) {
      return NextResponse.json({ error: 'Sale ID required for Short List purchase' }, { status: 400 });
    }

    // Reuse existing Stripe customer or create one
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const { priceId, mode } = PLAN_PRICES[requestedPlan];

    const sessionParams: Record<string, unknown> = {
      customer: customerId,
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?upgraded=${requestedPlan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        plan: requestedPlan,
        sale_id: saleId || '',
      },
    };

    if (mode === 'subscription') {
      (sessionParams as Record<string, unknown>).subscription_data = {
        metadata: { supabase_user_id: user.id, plan: requestedPlan },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
