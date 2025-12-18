import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('with');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!otherUserId) {
      return NextResponse.json({ error: 'Missing other user ID' }, { status: 400 });
    }

    // Get messages between current user and other user
    const { data: messages, error: messagesError } = await supabase
      .from('direct_messages')
      .select(`
        *,
        sender:user_profiles!direct_messages_sender_id_fkey(display_name, avatar_url),
        receiver:user_profiles!direct_messages_receiver_id_fkey(display_name, avatar_url)
      `)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (messagesError) {
      console.error('Messages fetch error:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Mark messages from other user as read
    await supabase
      .from('direct_messages')
      .update({ read: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', user.id)
      .eq('read', false);

    // Get conversation participants info
    const { data: otherUser } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url')
      .eq('user_id', otherUserId)
      .single();

    const formattedMessages = messages?.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.created_at,
      read: msg.read,
      sender: {
        id: msg.sender_id,
        name: msg.sender?.display_name || 'Unknown User',
        avatar: msg.sender?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      },
      receiver: {
        id: msg.receiver_id,
        name: msg.receiver?.display_name || 'Unknown User',
        avatar: msg.receiver?.avatar_url || "https://picsum.photos/seed/user1/100/100"
      }
    })) || [];

    return NextResponse.json({
      messages: formattedMessages.reverse(), // Return in chronological order
      conversation: {
        otherUser: {
          id: otherUserId,
          name: otherUser?.display_name || 'Unknown User',
          avatar: otherUser?.avatar_url || "https://picsum.photos/seed/user1/100/100"
        }
      }
    });

  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { receiver_id, content } = await request.json();

    if (!receiver_id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        content: content.trim(),
        read: false
      })
      .select()
      .single();

    if (messageError) {
      console.error('Message creation error:', messageError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message });

  } catch (error) {
    console.error('Send message API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
