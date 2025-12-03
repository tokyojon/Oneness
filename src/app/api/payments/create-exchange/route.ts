import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { getSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await req.json();
    const { op_amount, target_currency, user_id } = body;

    if (!op_amount || !target_currency || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user has sufficient balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('points')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentBalance = user.points?.total || 0;
    const fee = op_amount * 0.05;
    const totalDeducted = op_amount + fee;

    if (currentBalance < totalDeducted) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Calculate exchange rates (these should be configurable)
    const exchangeRates = {
      op_to_jpy: 100.0, // 1 OP = 100 JPY (inverse of purchase rate)
      op_to_usdt: 1.0,  // 1 OP = 1 USDT
      op_to_jpyc: 1.0,  // 1 OP = 1 JPYC (placeholder rate)
      op_to_tec: 1.0,   // 1 OP = 1 TEC (placeholder rate)
    };

    const rate = exchangeRates[`op_to_${target_currency.toLowerCase()}` as keyof typeof exchangeRates];
    if (!rate) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const payoutAmount = op_amount * rate;

    // Create exchange request transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user_id,
        type: 'exchange',
        amount: -op_amount, // Negative for deduction
        currency: target_currency,
        jpy_amount: target_currency === 'JPY' ? payoutAmount : null,
        status: 'pending_approval',
        description: `Exchange ${op_amount} OP to ${payoutAmount.toFixed(8)} ${target_currency}`,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) {
      console.error("Transaction creation error:", transactionError);
      return NextResponse.json({ error: "Failed to create exchange request" }, { status: 500 });
    }

    // Deduct OP from user's balance immediately (will be refunded if payout fails)
    const { error: ledgerError } = await supabase
      .from('points_ledger')
      .insert({
        user_id: user_id,
        amount: -totalDeducted,
        type: 'exchange',
        description: `Exchange request: ${op_amount} OP to ${target_currency}`,
        created_at: new Date().toISOString(),
      });

    if (ledgerError) {
      console.error("Ledger update error:", ledgerError);
      // Rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id);
      return NextResponse.json({ error: "Failed to process exchange" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Exchange request submitted successfully",
      transaction: {
        id: transaction.id,
        amount: op_amount,
        currency: target_currency,
        payout_amount: payoutAmount,
        status: 'pending_approval',
      },
    });
  } catch (error) {
    console.error("Exchange request error:", error);
    return NextResponse.json({
      error: "Failed to process exchange request",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
