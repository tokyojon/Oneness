import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { platform } = await request.json();

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

    // Get post details for share content
    const { data: post, error: postError } = await userSupabase
      .from('posts')
      .select(`
        content,
        user_profiles!posts_user_id_fkey (
          display_name
        )
      `)
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Track the share
    try {
      await userSupabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          platform: platform || 'unknown'
        });
    } catch (shareError) {
      // Don't fail the request if share tracking fails
      console.error('Share tracking error:', shareError);
    }

    // Generate share URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const postUrl = `${baseUrl}/dashboard/post/${postId}`;
    
    const authorName = post.user_profiles?.display_name || 'ユーザー';
    const truncatedContent = post.content.length > 100 
      ? post.content.substring(0, 100) + '...' 
      : post.content;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${authorName}さんの投稿: ${truncatedContent}`)}&url=${encodeURIComponent(postUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      copy: postUrl
    };

    return NextResponse.json({
      success: true,
      shareUrls,
      postUrl,
      message: '共有リンクを生成しました'
    });

  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
