import { getSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the user from the session using Supabase auth
    const authHeader = request.headers.get('authorization');
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      // Fallback to cookies
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name && value) {
            cookies[name] = value;
          }
        });
        token = cookies['access_token'];
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    // Verify the user is authenticated by decoding the JWT
    const supabase = getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid token - ' + authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token - No user' },
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

    // Get user profile data
    const { data: profile, error: profileError } = await userSupabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Get user's points balance
    const { data: pointsData, error: pointsError } = await userSupabase
      .from('points_ledger')
      .select('amount')
      .eq('user_id', user.id);

    if (pointsError) {
      console.error('Points fetch error:', pointsError);
      return NextResponse.json(
        { error: 'Failed to fetch points' },
        { status: 500 }
      );
    }

    // Calculate total balance
    const totalBalance = pointsData?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;

    // Get user's posts count
    const { data: postsData, error: postsError } = await userSupabase
      .from('posts')
      .select('id')
      .eq('user_id', user.id);

    if (postsError && postsError.code !== 'PGRST116') {
      console.error('Posts fetch error:', postsError);
    }

    const postsCount = postsData?.length || 0;

    // Get user's followers and following count (placeholder for future implementation)
    const followersCount = 0; // Would come from user_followers table
    const followingCount = 0; // Would come from user_following table

    // Get user's posts for profile display
    console.log('GET /api/profile - Fetching user posts for profile...');
    const { data: userPosts, error: userPostsError } = await userSupabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12);

    if (userPostsError && userPostsError.code !== 'PGRST116') {
      console.error('GET /api/profile - User posts fetch error:', userPostsError);
    }

    console.log('GET /api/profile - User posts fetched:', userPosts?.length || 0, 'posts');

    // Format posts for display
    const formattedPosts = userPosts?.map((post: any) => ({
      id: post.id,
      imageUrl: post.image_url || `https://picsum.photos/seed/post${post.id}/500/500`,
      imageHint: post.image_hint || 'user post',
      likes: post.likes || 0,
      comments: post.comments || 0,
      created_at: post.created_at
    })) || [];

    console.log('GET /api/profile - Formatted posts for profile:', formattedPosts.length);

    return NextResponse.json({
      profile: {
        id: user.id,
        name: profile?.display_name || user.email?.split('@')[0] || 'ユーザー',
        username: user.email?.split('@')[0] || 'user',
        email: user.email,
        avatarUrl: profile?.avatar_url || "https://picsum.photos/seed/user1/200/200",
        bannerUrl: profile?.banner_url || "/default_banner.png",
        bio: profile?.bio || "ワンネスキングダムの市民。貢献とつながりを大切にしています。",
        posts: postsCount,
        followers: followersCount,
        following: followingCount,
        op_balance: totalBalance,
        created_at: profile?.created_at || user.created_at,
        updated_at: profile?.updated_at || new Date().toISOString()
      },
      posts: formattedPosts
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Accept either camelCase keys or snake_case; normalize to snake_case for DB
  const updates: any = {};

  if ('display_name' in body) updates.display_name = body.display_name;
  if ('displayName' in body) updates.display_name = body.displayName;
  if ('bio' in body) updates.bio = body.bio;
  if ('location' in body) updates.location = body.location;
  if ('username' in body) updates.username = body.username;
  if ('avatar_url' in body) updates.avatar_url = body.avatar_url;

  // Ensure display_name is set for new profiles (NOT NULL constraint)
  if (!updates.display_name) {
    const { data: existing } = await supabase.from('user_profiles').select('display_name').eq('user_id', user.id).single();
    if (!existing) {
      updates.display_name = user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Kingdom Citizen';
    }
  }

  // allow clients to optionally include personality fields in same call
  if ('personality_profile' in body && typeof body.personality_profile === 'object') {
    const p = body.personality_profile;
    if ('socialStyle' in p) updates.social_style = p.socialStyle;
    if ('communicationStyle' in p) updates.communication_style = p.communicationStyle;
    if ('interests' in p && Array.isArray(p.interests)) updates.interests = p.interests.map(String);
    if ('workLifeBalance' in p) updates.work_life_balance = p.workLifeBalance;
    if ('meetingPreference' in p) updates.meeting_preference = p.meetingPreference;
    if ('personalityType' in p) updates.personality_type = p.personalityType;
    updates.personality_profile = p;
  }

  const dbRow = {
    user_id: user.id,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(dbRow, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error("Profile update error:", error);
    // Fallback if specific columns fail (e.g. they don't exist yet)
    if (error.code === '42703') {
      const basicUpdates = { ...dbRow };
      delete basicUpdates.social_style;
      delete basicUpdates.communication_style;
      delete basicUpdates.interests;
      delete basicUpdates.work_life_balance;
      delete basicUpdates.meeting_preference;
      delete basicUpdates.personality_type;

      const { data: retryData, error: retryError } = await supabase
        .from('user_profiles')
        .upsert(basicUpdates, { onConflict: 'user_id' })
        .select()
        .single();

      if (retryError) return NextResponse.json({ error: retryError.message }, { status: 500 });
      return NextResponse.json({ data: retryData }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
