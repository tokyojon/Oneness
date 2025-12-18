import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest';

    const authHeader = request.headers.get('authorization');
    let user: any | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user: authUser } } = await supabase.auth.getUser(token);
      user = authUser;
    }

    // Build base query
    let query = supabase
      .from('marketplace_ads')
      .select('*')
      .eq('status', 'active');

    // Apply filters first
    if (category && category !== 'すべて') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (sortBy === 'popular') {
      query = query.order('views', { ascending: false });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination after sorting
    query = query.range(offset, offset + limit - 1);

    const { data: ads, error: adsError } = await query;

    if (adsError) {
      console.error('Marketplace ads fetch error:', adsError);
      return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }

    // Get user profiles and likes in parallel for better performance
    let userProfiles: { [key: string]: any } = {};
    let likedAdIds = new Set<number>();

    if (ads && ads.length > 0) {
      const userIds = [...new Set(ads.map((ad: any) => ad.user_id))];
      const adIds = ads.map((ad: any) => ad.id);

      // Run both queries in parallel
      const [profilesResult, likesResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds),
        user ? supabase
          .from('marketplace_ad_likes')
          .select('ad_id')
          .eq('user_id', user.id)
          .in('ad_id', adIds) : Promise.resolve({ data: [] })
      ]);

      // Process profiles
      userProfiles = profilesResult.data?.reduce((acc: any, profile: any) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {}) || {};

      // Process likes
      likedAdIds = new Set(likesResult.data?.map((like: any) => like.ad_id) || []);
    }

    // Format ads
    const formattedAds = ads?.map((ad: any) => {
      const profile = userProfiles[ad.user_id];
      return {
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
          name: profile?.display_name || 'Unknown Seller',
          avatar: profile?.avatar_url || "https://picsum.photos/seed/user1/100/100"
        },
        isLiked: likedAdIds.has(ad.id)
      };
    }) || [];

    return NextResponse.json({ ads: formattedAds });

  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const { title, description, price, category, condition, location, image_url } = body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: ad, error: adError } = await supabase
      .from('marketplace_ads')
      .insert({
        title,
        description,
        price: parseFloat(price),
        category,
        condition: condition || 'used',
        location: location || '',
        image_url: image_url || '',
        user_id: user.id,
        status: 'active',
        views: 0,
        likes: 0,
        comments: 0
      })
      .select()
      .single();

    if (adError) {
      console.error('Create ad error:', adError);
      return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
    }

    return NextResponse.json({ ad });

  } catch (error) {
    console.error('Create ad API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
