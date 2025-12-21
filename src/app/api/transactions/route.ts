import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get the user from the session using Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Create a Supabase client with the user's JWT token
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's points ledger entries (transactions)
    const { data: ledgerEntries, error: ledgerError } = await userSupabase
      .from('points_ledger')
      .select(`
        id,
        amount,
        type,
        created_at,
        interaction_id,
        interactions (
          id,
          listing_id,
          listings (
            id,
            title,
            type
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (ledgerError) {
      console.error('Ledger fetch error:', ledgerError);
      // Return empty array if ledger table doesn't exist yet
      if (ledgerError.code === 'PGRST116') {
        return NextResponse.json({
          transactions: [],
          total: 0
        });
      }
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      );
    }

    // Transform ledger entries into transaction format
    const transactions = ledgerEntries?.map(entry => {
      const interaction = entry.interactions?.[0]; // Get first interaction since it's an array
      const listing = interaction?.listings?.[0]; // Get first listing
      return {
        id: entry.id,
        type: entry.type === 'earned' ? 'purchase' : entry.type === 'spent' ? 'exchange' : 'exchange',
        date: new Date(entry.created_at),
        op_amount: Math.abs(entry.amount),
        currency: 'JPY', // Default currency, could be made dynamic
        amount: Math.abs(entry.amount) * 1.5, // Default exchange rate, could be dynamic
        status: 'completed' as const
      };
    }) || [];

    // Also try to get transactions from the new transactions table if it exists
    const { data: exchangeTransactions, error: txError } = await userSupabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!txError && exchangeTransactions) {
      const formattedExchangeTxs = exchangeTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        date: new Date(tx.created_at),
        op_amount: tx.amount || tx.from_amount,
        currency: tx.currency || tx.to_currency,
        amount: tx.jpy_amount || tx.to_amount,
        status: tx.status,
        description: tx.description,
        stripe_payment_intent_id: tx.stripe_payment_intent_id,
        completed_at: tx.completed_at ? new Date(tx.completed_at) : null
      }));
      
      // Combine both sets of transactions
      transactions.push(...formattedExchangeTxs);
    }

    // Sort all transactions by date
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    return NextResponse.json({
      transactions,
      total: transactions.length
    });

  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
