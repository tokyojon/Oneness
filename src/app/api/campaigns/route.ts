import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client for public data (no auth required for campaigns)
    const publicSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get donation campaigns
    const { data: campaigns, error: campaignsError } = await publicSupabase
      .from('donation_campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (campaignsError) {
      console.error('Campaigns fetch error:', campaignsError);
      // Return mock data if table doesn't exist yet
      if (campaignsError.code === 'PGRST116') {
        const mockCampaigns = [
          {
            id: '1',
            title: 'コミュニティガーデン整備',
            description: '地域の人々が集まる緑豊かな空間を作ります。子供たちからお年寄りまで楽しめる場所です。',
            targetAmount: 10000,
            currentAmount: 6500,
            organizer: {
              name: '地域活性化委員会',
              avatar: 'https://picsum.photos/seed/campaign1/100/100',
              id: 'org_1'
            },
            category: 'community',
            endDate: '2024-12-31',
            supporters: 45,
            status: 'active'
          },
          {
            id: '2',
            title: '災害支援基金',
            description: '自然災害に見舞われた地域への緊急支援物資を提供します。',
            targetAmount: 50000,
            currentAmount: 32000,
            organizer: {
              name: 'ワンネス赤十字',
              avatar: 'https://picsum.photos/seed/campaign2/100/100',
              id: 'org_2'
            },
            category: 'emergency',
            endDate: '2024-11-30',
            supporters: 128,
            status: 'active'
          }
        ];
        
        return NextResponse.json({
          campaigns: mockCampaigns,
          total: mockCampaigns.length
        });
      }
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      total: campaigns?.length || 0
    });

  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Process donation
    const { campaignId, amount } = await request.json();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
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

    const { data: { user } } = await userSupabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check user's balance
    const { data: pointsData } = await userSupabase
      .from('points_ledger')
      .select('amount')
      .eq('user_id', user.id);

    const currentBalance = pointsData?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

    if (currentBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create donation record
    const { error: donationError } = await userSupabase
      .from('donations')
      .insert({
        campaign_id: campaignId,
        user_id: user.id,
        amount: amount,
        created_at: new Date().toISOString()
      });

    if (donationError) {
      console.error('Donation error:', donationError);
      return NextResponse.json(
        { error: 'Failed to process donation' },
        { status: 500 }
      );
    }

    // Deduct points from user
    const { error: pointsError } = await userSupabase
      .from('points_ledger')
      .insert({
        user_id: user.id,
        amount: -amount,
        type: 'donation',
        created_at: new Date().toISOString()
      });

    if (pointsError) {
      console.error('Points deduction error:', pointsError);
      return NextResponse.json(
        { error: 'Failed to deduct points' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Donation processed successfully'
    });

  } catch (error) {
    console.error('Donation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
