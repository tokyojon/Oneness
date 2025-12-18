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
    let user: any | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    // Get ad with basic info (no join to avoid foreign key issues)
    const { data: ad, error: adError } = await supabase
      .from('marketplace_ads')
      .select('*')
      .eq('id', adId)
      .single();

    if (adError) {
      console.error('Get ad error:', adError);
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 });
    }

    // Track the view (don't wait for it to avoid slowing down the response)
    (async () => {
      try {
        await supabase
          .from('marketplace_ad_views')
          .insert({
            ad_id: adId,
            user_id: user?.id || null,
            viewed_at: new Date().toISOString()
          });

        // Update the view counter
        await supabase
          .from('marketplace_ads')
          .update({
            views: (ad.views || 0) + 1
          })
          .eq('id', adId);
      } catch (error: any) {
        console.error('View tracking error:', error);
        // Don't fail the request for tracking errors
      }
    })();

    // Get comments
    const { data: comments, error: commentsError } = await supabase
      .from('marketplace_ad_comments')
      .select('*')
      .eq('ad_id', adId)
      .order('created_at', { ascending: true });

    // Get offers
    const { data: offers, error: offersError } = await supabase
      .from('marketplace_offers')
      .select('*')
      .eq('ad_id', adId)
      .order('created_at', { ascending: false });

    // Get all user IDs involved
    const userIds = new Set<string>();
    userIds.add(ad.user_id);
    comments?.forEach((comment: any) => userIds.add(comment.user_id));
    offers?.forEach((offer: any) => userIds.add(offer.user_id));

    // Get user profiles for all involved users
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', Array.from(userIds));

    const userProfiles: { [key: string]: any } = {};
    profiles?.forEach((profile: any) => {
      userProfiles[profile.user_id] = profile;
    });

    // Check if user liked this ad
    let isLiked = false;
    if (user) {
      const { data: like } = await supabase
        .from('marketplace_ad_likes')
        .select('id')
        .eq('ad_id', adId)
        .eq('user_id', user.id)
        .single();
      isLiked = !!like;
    }

    const formattedAd = {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      image_url: ad.image_url,
      category: ad.category,
      condition: ad.condition,
      location: ad.location,
      status: ad.status,
      views: ad.views || 0,
      likes: ad.likes || 0,
      commentsCount: ad.comments || 0,
      created_at: ad.created_at,
      seller: {
        id: ad.user_id,
        name: userProfiles[ad.user_id]?.display_name || 'Unknown Seller',
        avatar: userProfiles[ad.user_id]?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      },
      isLiked,
      comments: comments?.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author: {
          id: comment.user_id,
          name: userProfiles[comment.user_id]?.display_name || 'Unknown User',
          avatar: userProfiles[comment.user_id]?.avatar_url || "https://picsum.photos/seed/user1/100/100"
        }
      })) || [],
      offers: offers?.map((offer: any) => ({
        id: offer.id,
        amount: offer.amount,
        message: offer.message,
        status: offer.status,
        created_at: offer.created_at,
        buyer: {
          id: offer.user_id,
          name: userProfiles[offer.user_id]?.display_name || 'Unknown User',
          avatar: userProfiles[offer.user_id]?.avatar_url || "https://picsum.photos/seed/user1/100/100"
        }
      })) || []
    };

    return NextResponse.json({ ad: formattedAd });

  } catch (error) {
    console.error('Get ad API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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
    const { data: existingAd } = await supabase
      .from('marketplace_ads')
      .select('user_id')
      .eq('id', adId)
      .single();

    if (!existingAd || existingAd.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, price, category, condition, location, image_url, status } = body;

    const { data: ad, error: adError } = await supabase
      .from('marketplace_ads')
      .update({
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        category,
        condition,
        location,
        image_url,
        status
      })
      .eq('id', adId)
      .select()
      .single();

    if (adError) {
      console.error('Update ad error:', adError);
      return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
    }

    return NextResponse.json({ ad });

  } catch (error) {
    console.error('Update ad API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
    const { data: existingAd } = await supabase
      .from('marketplace_ads')
      .select('user_id')
      .eq('id', adId)
      .single();

    if (!existingAd || existingAd.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('marketplace_ads')
      .delete()
      .eq('id', adId);

    if (deleteError) {
      console.error('Delete ad error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Ad deleted successfully' });

  } catch (error) {
    console.error('Delete ad API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
