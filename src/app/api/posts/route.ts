import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/posts - Starting posts fetch...');
    
    // Get the user from the session using Supabase auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('GET /api/posts - No authorization header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log('GET /api/posts - Token found');
    
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
      console.log('GET /api/posts - Invalid token:', authError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('GET /api/posts - User authenticated:', user.id);

    // Get posts with user information
    console.log('GET /api/posts - Fetching posts from database...');
    const { data: posts, error: postsError } = await userSupabase
      .from('posts')
      .select(`
        *,
        user_profiles (
          display_name,
          avatar_url,
          user_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsError) {
      console.error('GET /api/posts - Posts fetch error:', postsError);
      // Return empty array if posts table doesn't exist yet
      if (postsError.code === 'PGRST116') {
        console.log('GET /api/posts - Posts table does not exist, returning empty array');
        return NextResponse.json({ posts: [] });
      }
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    console.log('GET /api/posts - Posts fetched:', posts?.length || 0, 'posts');

    // Get user's likes for these posts
    const postIds = posts?.map(post => post.id) || [];
    console.log('GET /api/posts - Fetching user likes for posts:', postIds);
    const { data: userLikes, error: likesError } = await userSupabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);
    console.log('GET /api/posts - User liked posts:', Array.from(likedPostIds));

    // Get user's bookmarks for these posts
    console.log('GET /api/posts - Fetching user bookmarks for posts:', postIds);
    const { data: userBookmarks, error: bookmarksError } = await userSupabase
      .from('user_bookmarks')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds);

    const bookmarkedPostIds = new Set(userBookmarks?.map(bookmark => bookmark.post_id) || []);
    console.log('GET /api/posts - User bookmarked posts:', Array.from(bookmarkedPostIds));

    // Format posts for frontend
    const formattedPosts = posts?.map(post => ({
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
        name: post.user_profiles?.display_name || 'Unknown User',
        username: post.user_id,
        avatarUrl: post.user_profiles?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    })) || [];

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
      console.log('POST /api/posts - Invalid token:', authError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('POST /api/posts - User authenticated:', user.id);

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
