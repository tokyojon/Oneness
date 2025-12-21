import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Check if user already bookmarked this post
    const { data: existingBookmark, error: bookmarkCheckError } = await userSupabase
      .from('user_bookmarks')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
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
        .eq('user_id', user.id);

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
          user_id: user.id
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
