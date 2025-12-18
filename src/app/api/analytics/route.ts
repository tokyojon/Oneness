import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Track ad view
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let user = null;

    // Optional auth - anonymous views are allowed
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    const { ad_id, action } = await request.json();

    if (!ad_id || !action) {
      return NextResponse.json({ error: 'Missing ad_id or action' }, { status: 400 });
    }

    if (!['view', 'click'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be view or click' }, { status: 400 });
    }

    const table = action === 'view' ? 'marketplace_ad_views' : 'marketplace_ad_clicks';
    const column = action === 'view' ? 'viewed_at' : 'clicked_at';

    // Insert the tracking record
    const { error: trackingError } = await supabase
      .from(table)
      .insert({
        ad_id,
        user_id: user?.id || null,
        [column]: new Date().toISOString()
      });

    if (trackingError) {
      console.error(`${action} tracking error:`, trackingError);
      // Don't return error for tracking failures - analytics shouldn't break the user experience
    }

    // Update the counter in marketplace_ads
    const counterField = action === 'view' ? 'views' : 'clicks';

    // Note: This is a simplified approach. In production, you might want to use database triggers
    // or background jobs to update counters to avoid race conditions
    const { data: ad } = await supabase
      .from('marketplace_ads')
      .select(counterField)
      .eq('id', ad_id)
      .single();

    if (ad && counterField in ad && typeof ad[counterField as keyof typeof ad] === 'number') {
      await supabase
        .from('marketplace_ads')
        .update({
          [counterField]: (ad[counterField as keyof typeof ad] as number) + 1
        })
        .eq('id', ad_id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
