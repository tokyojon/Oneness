import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { amount, recipientId } = await request.json();

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

    // Verify the sender is authenticated
    const { data: { user: sender }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !sender) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid tip amount' },
        { status: 400 }
      );
    }

    // Get sender's current balance
    const { data: senderPoints, error: balanceError } = await userSupabase
      .from('points_ledger')
      .select('amount')
      .eq('user_id', sender.id);

    if (balanceError) {
      console.error('Balance fetch error:', balanceError);
      return NextResponse.json(
        { error: 'Failed to fetch balance' },
        { status: 500 }
      );
    }

    const senderBalance = senderPoints?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

    if (amount > senderBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get recipient's user ID from username
    const { data: recipientProfile, error: recipientError } = await userSupabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', recipientId)
      .single();

    if (recipientError || !recipientProfile) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Start transaction
    try {
      // Deduct points from sender
      const { error: deductError } = await userSupabase
        .from('points_ledger')
        .insert({
          user_id: sender.id,
          amount: -amount,
          type: 'tip_sent',
          related_post_id: postId,
          related_user_id: recipientProfile.user_id
        });

      if (deductError) {
        console.error('Deduct error:', deductError);
        throw new Error('Failed to deduct points');
      }

      // Add points to recipient
      const { error: addError } = await userSupabase
        .from('points_ledger')
        .insert({
          user_id: recipientProfile.user_id,
          amount: amount,
          type: 'tip_received',
          related_post_id: postId,
          related_user_id: sender.id
        });

      if (addError) {
        console.error('Add error:', addError);
        throw new Error('Failed to add points to recipient');
      }

      // Record the tip transaction
      const { error: tipRecordError } = await userSupabase
        .from('tip_transactions')
        .insert({
          sender_id: sender.id,
          recipient_id: recipientProfile.user_id,
          post_id: postId,
          amount: amount
        });

      if (tipRecordError) {
        console.error('Tip record error:', tipRecordError);
        // Don't fail the transaction if recording fails
      }

      return NextResponse.json({
        success: true,
        amount,
        recipientId: recipientProfile.user_id,
        message: 'チップを送信しました！'
      });

    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { error: 'Transaction failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Tip API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
