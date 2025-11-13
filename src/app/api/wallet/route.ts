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
    
    // Verify the user is authenticated by decoding the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Create a Supabase client for database operations with user context
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

    // Get user's wallet info and balance
    const { data: profile, error: profileError } = await userSupabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get user's points balance
    const { data: pointsData, error: pointsError } = await userSupabase
      .from('points_ledger')
      .select('amount, type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    if (pointsError) {
      console.error('Points fetch error:', pointsError);
      return NextResponse.json(
        { error: 'Failed to fetch wallet data' },
        { status: 500 }
      );
    }

    // Calculate total balance
    const totalBalance = pointsData?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;

    // Create wallet object
    const wallet = {
      id: `wallet_${user.id}`,
      user_id: user.id,
      wallet_address: `0x${user.id.slice(0, 8)}${user.id.slice(-8)}`,
      balance: totalBalance,
      created_at: profile?.created_at || new Date().toISOString(),
      updated_at: profile?.updated_at || new Date().toISOString()
    };

    // Transform points ledger into wallet transactions
    const transactions = pointsData?.map((entry: any) => ({
      id: entry.id || `txn_${entry.created_at}`,
      from_wallet_id: entry.amount > 0 ? 'system' : wallet.id,
      to_wallet_id: entry.amount > 0 ? wallet.id : 'system',
      amount: Math.abs(entry.amount),
      transaction_hash: `0x${(entry.id || entry.created_at).toString(16)}`,
      type: entry.amount > 0 ? 'reward' : 'spent',
      status: 'completed',
      created_at: entry.created_at
    })) || [];

    return NextResponse.json({
      wallet,
      transactions,
      totalBalance
    });

  } catch (error) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
