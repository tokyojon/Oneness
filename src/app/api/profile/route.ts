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

export async function PUT(request: NextRequest) {
  try {
    // Update user profile
    const { display_name, bio, location, avatar_url, banner_url } = await request.json();

    const supabase = getSupabaseServerClient();

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
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
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

    // Dynamic payload construction
    const updates: any = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    };
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (banner_url !== undefined) updates.banner_url = banner_url;

    // Update or create profile
    const { data: profile, error } = await userSupabase
      .from('user_profiles')
      .upsert(updates)
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

  } catch (error: any) {
    console.error('Profile update API error (DETAILS):', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
