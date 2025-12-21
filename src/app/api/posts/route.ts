import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/posts - Starting posts fetch...');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const authHeader = request.headers.get('authorization');
    let user: any | null = null;
    let token: string | null = null;
    let userSupabase: ReturnType<typeof createClient> | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      console.log('GET /api/posts - Token found');

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !authUser) {
        console.log('GET /api/posts - Invalid token:', authError);
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      user = authUser;
      console.log('GET /api/posts - User authenticated:', user.id);

      userSupabase = createClient(
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
    } else {
      console.log('GET /api/posts - No authorization header, proceeding anonymously');
    }

    // Get posts with user information using service supabase to show all posts
    const postsClient = supabase;
    console.log('GET /api/posts - Fetching posts from database...');
    const { data: posts, error: postsError } = await postsClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('GET /api/posts - Raw posts data:', posts);
    console.log('GET /api/posts - Posts error:', postsError);

    if (postsError) {
      console.error('GET /api/posts - Posts fetch error:', postsError);
      // Return empty array for missing table or any other fetch issue
      return NextResponse.json({ posts: [] });
    }

    console.log('GET /api/posts - Posts fetched:', posts?.length || 0, 'posts');

    // Fetch user profiles for the post authors
    let userProfiles: { [key: string]: any } = {};
    if (posts && posts.length > 0) {
      const userIds = [...new Set(posts.map((post: any) => post.user_id))];
      console.log('GET /api/posts - Fetching profiles for user IDs:', userIds);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      console.log('GET /api/posts - Raw profiles data:', profiles);
      console.log('GET /api/posts - Profiles error:', profilesError);

      if (profilesError) {
        console.error('GET /api/posts - Profiles fetch error:', profilesError);
      } else {
        userProfiles = profiles?.reduce((acc: any, profile: any) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {}) || {};
        console.log('GET /api/posts - Profiles fetched for users:', Object.keys(userProfiles));
      }
    }

    // Get user's likes for these posts
    const postIds = posts?.map((post: any) => post.id) || [];
    let likedPostIds = new Set<number>();
    if (postIds.length > 0 && user && userSupabase) {
      console.log('GET /api/posts - Fetching user likes for posts:', postIds);
      const { data: userLikes, error: likesError } = await userSupabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (likesError) {
        console.error('GET /api/posts - Likes fetch error:', likesError);
      } else {
        likedPostIds = new Set(userLikes?.map((like: any) => like.post_id) || []);
        console.log('GET /api/posts - User liked posts:', Array.from(likedPostIds));
      }
    }

    // Get user's bookmarks for these posts
    let bookmarkedPostIds = new Set<number>();
    if (postIds.length > 0 && user && userSupabase) {
      console.log('GET /api/posts - Fetching user bookmarks for posts:', postIds);
      const { data: userBookmarks, error: bookmarksError } = await userSupabase
        .from('user_bookmarks')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      if (bookmarksError) {
        console.error('GET /api/posts - Bookmarks fetch error:', bookmarksError);
      } else {
        bookmarkedPostIds = new Set(userBookmarks?.map((bookmark: any) => bookmark.post_id) || []);
        console.log('GET /api/posts - User bookmarked posts:', Array.from(bookmarkedPostIds));
      }
    }

    // Format posts for frontend
    const formattedPosts = posts?.map((post: any) => {
      const profile = userProfiles[post.user_id];
      return {
        id: post.id,
        content: post.content,
        imageUrl: post.image_url,
        imageHint: post.image_hint,
        videoUrl: post.video_url,
        likes: post.likes || 0,
        comments: post.comments || 0,
        timestamp: new Date(post.created_at).toLocaleString('ja-JP'),
        isLiked: likedPostIds.has(post.id),
        isBookmarked: bookmarkedPostIds.has(post.id),
        author: {
          name: profile?.display_name || 'Unknown User',
          username: post.user_id,
          avatarUrl: profile?.avatar_url || "https://picsum.photos/seed/user1/100/100"
        }
      };
    }) || [];

    console.log('GET /api/posts - Formatted posts count:', formattedPosts.length);

    return NextResponse.json({ posts: formattedPosts });

  } catch (error) {
    console.error('GET /api/posts - API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/posts - Starting post creation...');
    
    // Get the user from the session using Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('POST /api/posts - No authorization header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('POST /api/posts - Token found');
    
    // Verify the user is authenticated by decoding the JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('POST /api/posts - Invalid token:', authError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('POST /api/posts - User authenticated:', user.id);

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

    // Parse request body
    const { content, imageUrl, imageHint, videoUrl } = await request.json();
    console.log('POST /api/posts - Request body:', { content, imageUrl, imageHint, videoUrl });

    if (!content && !imageUrl && !videoUrl) {
      console.log('POST /api/posts - No content provided');
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    // Create new post
    console.log('POST /api/posts - Inserting post into database...');
    const { data: newPost, error: insertError } = await userSupabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        image_url: imageUrl,
        image_hint: imageHint,
        video_url: videoUrl,
        likes: 0,
        comments: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('POST /api/posts - Post creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    console.log('POST /api/posts - Post created successfully:', newPost);

    // Get user profile for response
    const { data: profile } = await userSupabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    console.log('POST /api/posts - User profile:', profile);

    // Format response
    const formattedPost = {
      id: newPost.id,
      content: newPost.content,
      imageUrl: newPost.image_url,
      imageHint: newPost.image_hint,
      videoUrl: newPost.video_url,
      likes: newPost.likes,
      comments: newPost.comments,
      timestamp: new Date(newPost.created_at).toLocaleString('ja-JP'),
      isLiked: false, // User just created it, so they haven't liked it yet
      isBookmarked: false, // User just created it, so they haven't bookmarked it yet
      author: {
        name: profile?.display_name || user.email?.split('@')[0] || 'ユーザー',
        username: user.email?.split('@')[0] || 'user',
        avatarUrl: profile?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    };

    console.log('POST /api/posts - Formatted post:', formattedPost);

    return NextResponse.json({
      success: true,
      post: formattedPost,
      message: '投稿が正常に作成されました'
    });

  } catch (error) {
    console.error('POST /api/posts - API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
