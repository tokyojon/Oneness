import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JPY_PER_OP = 100.0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { op_amount, user_id } = body;

    if (!op_amount || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amount = Math.round(op_amount);
    const baseJpyAmount = amount * JPY_PER_OP;
    const fee = Math.round(baseJpyAmount * 0.05); // 5% fee
    const totalJpyAmount = baseJpyAmount + fee;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${amount} OP Purchase (including 5% fee)`,
              description: `Purchase ${amount} Oneness Points - Base: ¥${baseJpyAmount.toLocaleString()}, Fee: ¥${fee.toLocaleString()}`,
            },
            unit_amount: totalJpyAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/exchange?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/exchange?canceled=true`,
      metadata: {
        user_id: user_id,
        op_amount: amount.toString(),
        base_amount: baseJpyAmount.toString(),
        fee_amount: fee.toString(),
      },
    });

    // Record the transaction in our database
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user_id,
        type: 'purchase',
        amount: amount,
        currency: 'JPY',
        jpy_amount: totalJpyAmount,
        status: 'pending',
        stripe_payment_intent_id: session.id,
        description: `Purchase ${amount} OP - Base: ¥${baseJpyAmount.toLocaleString()}, Fee: ¥${fee.toLocaleString()}`,
        metadata: {
          base_amount: baseJpyAmount,
          fee_amount: fee,
          total_amount: totalJpyAmount
        },
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error("Transaction recording error:", transactionError);
      // Don't fail the payment creation if transaction recording fails
    }

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({
      error: "Failed to create payment",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
