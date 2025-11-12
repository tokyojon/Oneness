import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

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
    const totalBalance = pointsData?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

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
    const formattedPosts = userPosts?.map(post => ({
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
    const { display_name, bio, avatar_url, banner_url } = await request.json();
    
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
