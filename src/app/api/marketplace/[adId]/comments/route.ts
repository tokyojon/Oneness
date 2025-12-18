import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const adId = params.adId;

    const { data: comments, error: commentsError } = await supabase
      .from('marketplace_ad_comments')
      .select('*')
      .eq('ad_id', adId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Get comments error:', commentsError);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Get user profiles for comment authors
    let userProfiles: { [key: string]: any } = {};
    if (comments && comments.length > 0) {
      const userIds = [...new Set(comments.map((comment: any) => comment.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      userProfiles = profiles?.reduce((acc: any, profile: any) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {}) || {};
    }

    const formattedComments = comments?.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: comment.user_id,
        name: userProfiles[comment.user_id]?.display_name || 'Unknown User',
        avatar: userProfiles[comment.user_id]?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    })) || [];

    return NextResponse.json({ comments: formattedComments });

  } catch (error) {
    console.error('Get comments API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    const adId = params.adId;
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const { data: comment, error: commentError } = await supabase
      .from('marketplace_ad_comments')
      .insert({
        ad_id: parseInt(adId),
        user_id: user.id,
        content: content.trim()
      })
      .select()
      .single();

    if (commentError) {
      console.error('Create comment error:', commentError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // Get user profile for the comment author
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    // TODO: Increment comments count
    // await supabase
    //   .from('marketplace_ads')
    //   .update({ comments: supabase.raw('comments + 1') })
    //   .eq('id', adId);

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: comment.user_id,
        name: profile?.display_name || 'Unknown User',
        avatar: profile?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    };

    return NextResponse.json({ comment: formattedComment });

  } catch (error) {
    console.error('Create comment API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
