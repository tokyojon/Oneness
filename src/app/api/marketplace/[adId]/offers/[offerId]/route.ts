import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { adId: string; offerId: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const adId = params.adId;
    const offerId = params.offerId;
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
    const { status } = body;

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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

    const { data: offer, error: offerError } = await supabase
      .from('marketplace_offers')
      .update({ status })
      .eq('id', offerId)
      .eq('ad_id', adId)
      .select()
      .single();

    if (offerError) {
      console.error('Update offer error:', offerError);
      return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
    }

    // If accepted, update ad status to sold
    if (status === 'accepted') {
      await supabase
        .from('marketplace_ads')
        .update({ status: 'sold' })
        .eq('id', adId);
    }

    return NextResponse.json({ offer });

  } catch (error) {
    console.error('Update offer API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
