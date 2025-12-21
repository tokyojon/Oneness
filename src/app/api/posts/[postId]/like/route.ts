import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient<any>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    const guestUserId = request.headers.get('x-guest-user-id');
    const authHeader = request.headers.get('authorization');

    let userId: string | null = null;
    let userSupabase: ReturnType<typeof createClient<any>> = supabase;

    if (guestUserId) {
      userId = guestUserId;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      userId = user.id;
      userSupabase = createClient<any>(
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already liked this post
    const { data: existingLike, error: likeCheckError } = await userSupabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      console.error('Like check error:', likeCheckError);
      return NextResponse.json(
        { error: 'Failed to check like status' },
        { status: 500 }
      );
    }

    let isLiked = false;
    let likesCount = 0;

    if (existingLike) {
      // Unlike the post
      const { error: unlikeError } = await userSupabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (unlikeError) {
        console.error('Unlike error:', unlikeError);
        return NextResponse.json(
          { error: 'Failed to unlike post' },
          { status: 500 }
        );
      }

      isLiked = false;
    } else {
      // Like the post
      const { error: likeError } = await userSupabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });

      if (likeError) {
        console.error('Like error:', likeError);
        return NextResponse.json(
          { error: 'Failed to like post' },
          { status: 500 }
        );
      }

      isLiked = true;
    }

    // Get updated likes count
    const { data: likesData, error: countError } = await userSupabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId);

    if (countError) {
      console.error('Count error:', countError);
      likesCount = existingLike ? 0 : 1; // Fallback
    } else {
      likesCount = likesData?.length || 0;
    }

    // Update the post's likes count
    await userSupabase
      .from('posts')
      .update({ likes: likesCount })
      .eq('id', postId);

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount,
      message: isLiked ? '投稿にいいねしました' : 'いいねを取り消しました'
    });

  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
