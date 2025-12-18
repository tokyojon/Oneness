import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('marketplace_ad_likes')
      .select('id')
      .eq('ad_id', adId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('marketplace_ad_likes')
        .delete()
        .eq('id', existingLike.id);

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabase
        .from('marketplace_ad_likes')
        .insert({
          ad_id: parseInt(adId),
          user_id: user.id
        });

      return NextResponse.json({ liked: true });
    }

  } catch (error) {
    console.error('Like ad API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
