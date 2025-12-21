import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSuccess(session);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

async function handleCheckoutSuccess(session: Stripe.Checkout.Session) {
  const { user_id, op_amount } = session.metadata || {};

  if (!user_id || !op_amount) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const amount = parseInt(op_amount);

  try {
    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', session.id);

    if (updateError) {
      console.error('Failed to update transaction:', updateError);
    }

    // Add OP to user's points ledger
    const { error: ledgerError } = await supabase
      .from('points_ledger')
      .insert({
        user_id: user_id,
        amount: amount,
        type: 'purchase',
        description: `Purchased ${amount} OP via Stripe Checkout`,
        created_at: new Date().toISOString(),
      });

    if (ledgerError) {
      console.error('Failed to update points ledger:', ledgerError);
    }

    console.log(`Successfully processed checkout for user ${user_id}: ${amount} OP`);
  } catch (error) {
    console.error('Error processing checkout success:', error);
  }
}
