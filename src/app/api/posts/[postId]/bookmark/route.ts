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

      const userScoped = createClient<any>(
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

      const { data: { user }, error: authError } = await userScoped.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      userId = user.id;
      userSupabase = userScoped;
    } else {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already bookmarked this post
    const { data: existingBookmark, error: bookmarkCheckError } = await userSupabase
      .from('user_bookmarks')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (bookmarkCheckError && bookmarkCheckError.code !== 'PGRST116') {
      console.error('Bookmark check error:', bookmarkCheckError);
      return NextResponse.json(
        { error: 'Failed to check bookmark status' },
        { status: 500 }
      );
    }

    let isBookmarked = false;

    if (existingBookmark) {
      // Remove bookmark
      const { error: unbookmarkError } = await userSupabase
        .from('user_bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (unbookmarkError) {
        console.error('Unbookmark error:', unbookmarkError);
        return NextResponse.json(
          { error: 'Failed to remove bookmark' },
          { status: 500 }
        );
      }

      isBookmarked = false;
    } else {
      // Add bookmark
      const { error: bookmarkError } = await userSupabase
        .from('user_bookmarks')
        .insert({
          post_id: postId,
          user_id: userId
        });

      if (bookmarkError) {
        console.error('Bookmark error:', bookmarkError);
        return NextResponse.json(
          { error: 'Failed to bookmark post' },
          { status: 500 }
        );
      }

      isBookmarked = true;
    }

    return NextResponse.json({
      success: true,
      isBookmarked,
      message: isBookmarked ? '投稿を保存しました' : '保存を取り消しました'
    });

  } catch (error) {
    console.error('Bookmark toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
