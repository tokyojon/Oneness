import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const adId = params.adId;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user owns the ad
    const { data: ad } = await supabase
      .from('marketplace_ads')
      .select('user_id')
      .eq('id', adId)
      .single();

    if (!ad || ad.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: offers, error: offersError } = await supabase
      .from('marketplace_offers')
      .select(`
        *,
        user_profiles (
          display_name,
          avatar_url,
          user_id
        )
      `)
      .eq('ad_id', adId)
      .order('created_at', { ascending: false });

    if (offersError) {
      console.error('Get offers error:', offersError);
      return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }

    const formattedOffers = offers?.map((offer: any) => ({
      id: offer.id,
      amount: offer.amount,
      message: offer.message,
      status: offer.status,
      created_at: offer.created_at,
      buyer: {
        id: offer.user_id,
        name: offer.user_profiles?.display_name || 'Unknown User',
        avatar: offer.user_profiles?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    })) || [];

    return NextResponse.json({ offers: formattedOffers });

  } catch (error) {
    console.error('Get offers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const adId = params.adId;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, message } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const { data: offer, error: offerError } = await supabase
      .from('marketplace_offers')
      .insert({
        ad_id: parseInt(adId),
        user_id: user.id,
        amount: parseFloat(amount),
        message: message || '',
        status: 'pending'
      })
      .select()
      .single();

    if (offerError) {
      console.error('Create offer error:', offerError);
      return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
    }

    return NextResponse.json({ offer });

  } catch (error) {
    console.error('Create offer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
