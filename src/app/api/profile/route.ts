import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

<<<<<<< HEAD
const supabase = createClient(
=======
const supabase = createClient<any>(
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
<<<<<<< HEAD
    // Get the user from the session using Supabase auth
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No Bearer token' },
=======
    const guestUserId = request.headers.get('x-guest-user-id');
    const authHeader = request.headers.get('authorization');

    // Guest-mode path: trust x-guest-user-id and use service client
    if (guestUserId) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', guestUserId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('id, email, created_at, updated_at')
        .eq('id', guestUserId)
        .single();

      const onboardingCompleted = !!(
        (profile?.display_name && profile.display_name !== 'ゲスト') ||
        (profile?.bio && String(profile.bio).trim()) ||
        (profile?.location && String(profile.location).trim()) ||
        (profile?.occupation && String(profile.occupation).trim()) ||
        (profile?.relationship_status && String(profile.relationship_status).trim()) ||
        (profile?.favorite_quote && String(profile.favorite_quote).trim()) ||
        ((profile?.interests?.length ?? 0) > 0) ||
        ((profile?.personality_traits?.length ?? 0) > 0) ||
        ((profile?.goals?.length ?? 0) > 0) ||
        ((profile?.values?.length ?? 0) > 0) ||
        ((profile?.hobbies?.length ?? 0) > 0)
      );

      const { data: pointsData } = await supabase
        .from('points_ledger')
        .select('amount')
        .eq('user_id', guestUserId);

      const totalBalance = pointsData?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;

      const { data: postsData } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', guestUserId);

      const postsCount = postsData?.length || 0;

      const { data: userPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', guestUserId)
        .order('created_at', { ascending: false })
        .limit(12);

      const formattedPosts = userPosts?.map((post: any) => ({
        id: post.id,
        imageUrl: post.image_url || `https://picsum.photos/seed/post${post.id}/500/500`,
        imageHint: post.image_hint || 'user post',
        likes: post.likes || 0,
        comments: post.comments || 0,
        created_at: post.created_at,
      })) || [];

      return NextResponse.json({
        profile: {
          id: guestUserId,
          name: profile?.display_name || 'ゲスト',
          username: (userRow?.email || 'guest@oneness.local').split('@')[0],
          email: userRow?.email || 'guest@oneness.local',
          avatarUrl: profile?.avatar_url || "https://picsum.photos/seed/user1/200/200",
          bannerUrl: profile?.banner_url || "/default_banner.png",
          bio: profile?.bio || "",
          posts: postsCount,
          followers: 0,
          following: 0,
          op_balance: totalBalance,
          created_at: profile?.created_at || userRow?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || userRow?.updated_at || new Date().toISOString(),
          onboardingCompleted,
        },
        onboarding: {
          location: profile?.location || '',
          occupation: profile?.occupation || '',
          relationshipStatus: profile?.relationship_status || '',
          favoriteQuote: profile?.favorite_quote || '',
          interests: profile?.interests || [],
          personality: profile?.personality_traits || [],
          goals: profile?.goals || [],
          values: profile?.values || [],
          hobbies: profile?.hobbies || [],
        },
        posts: formattedPosts,
      });
    }

    // Legacy Bearer token path (kept for now)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
<<<<<<< HEAD
    
    // Verify the user is authenticated by decoding the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid token - ' + authError.message },
=======

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
        { status: 401 }
      );
    }

<<<<<<< HEAD
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token - No user' },
        { status: 401 }
      );
    }

    // Create a Supabase client for database operations with user context
    const userSupabase = createClient(
=======
    const userSupabase = createClient<any>(
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
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

export async function PUT(request: NextRequest) {
  try {
    // Update user profile
<<<<<<< HEAD
    const { display_name, bio, avatar_url, banner_url } = await request.json();
    
=======
    const {
      display_name,
      bio,
      avatar_url,
      banner_url,
      location,
      occupation,
      relationship_status,
      favorite_quote,
      interests,
      personality_traits,
      goals,
      values,
      hobbies,
    } = await request.json();

    const guestUserId = request.headers.get('x-guest-user-id');
    if (guestUserId) {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: guestUserId,
          display_name,
          bio,
          avatar_url,
          banner_url,
          location,
          occupation,
          relationship_status,
          favorite_quote,
          interests,
          personality_traits,
          goals,
          values,
          hobbies,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }

      return NextResponse.json({ success: true, profile });
    }

>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
<<<<<<< HEAD
    
    // Verify the user is authenticated by decoding the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
=======

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

<<<<<<< HEAD
    // Create a Supabase client for database operations with user context
    const userSupabase = createClient(
=======
    const userSupabase = createClient<any>(
>>>>>>> 27f513108b8ea2cfb0d05b37f9cb2fdd04931371
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

    // Update or create profile
    const { data: profile, error } = await userSupabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        display_name: display_name,
        bio: bio,
        avatar_url: avatar_url,
        banner_url: banner_url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profile
    });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
