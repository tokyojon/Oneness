import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

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

    // Get comments for this post
    const { data: comments, error: commentsError } = await userSupabase
      .from('post_comments')
      .select(`
        *,
        user_profiles (
          display_name,
          avatar_url,
          user_id
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Comments fetch error:', commentsError);
      // Return empty array if comments table doesn't exist yet
      if (commentsError.code === 'PGRST116') {
        return NextResponse.json({ comments: [] });
      }
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Format comments for frontend
    const formattedComments = comments?.map(comment => ({
      id: comment.id,
      content: comment.content,
      timestamp: new Date(comment.created_at).toLocaleString('ja-JP'),
      author: {
        name: comment.user_profiles?.display_name || 'Unknown User',
        username: comment.user_profiles?.user_id || 'unknown',
        avatarUrl: comment.user_profiles?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    })) || [];

    return NextResponse.json({ comments: formattedComments });

  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

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

    // Parse request body
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Create new comment
    const { data: newComment, error: insertError } = await userSupabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Comment creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Get updated comments count
    const { data: allComments, error: countError } = await userSupabase
      .from('post_comments')
      .select('id')
      .eq('post_id', postId);

    const commentsCount = !countError ? (allComments?.length || 0) : 0;

    // Update the post's comments count
    await userSupabase
      .from('posts')
      .update({ comments: commentsCount })
      .eq('id', postId);

    // Get user profile for response
    const { data: profile } = await userSupabase
      .from('user_profiles')
      .select('display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    // Format response
    const formattedComment = {
      id: newComment.id,
      content: newComment.content,
      timestamp: new Date(newComment.created_at).toLocaleString('ja-JP'),
      author: {
        name: profile?.display_name || user.email?.split('@')[0] || 'ユーザー',
        username: user.email?.split('@')[0] || 'user',
        avatarUrl: profile?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    };

    return NextResponse.json({
      success: true,
      comment: formattedComment,
      commentsCount,
      message: 'コメントが投稿されました'
    });

  } catch (error) {
    console.error('Comment creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
