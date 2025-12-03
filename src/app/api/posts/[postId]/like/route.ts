import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const supabase = getSupabaseServerClient();
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

    // Check if user already liked this post
    const { data: existingLike, error: likeCheckError } = await userSupabase
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
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
        .eq('user_id', user.id);

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
          user_id: user.id
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
