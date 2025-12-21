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

    // Get all unique conversation partners
    const { data: sentMessages, error: sentError } = await supabase
      .from('direct_messages')
      .select('receiver_id')
      .eq('sender_id', user.id);

    const { data: receivedMessages, error: receivedError } = await supabase
      .from('direct_messages')
      .select('sender_id')
      .eq('receiver_id', user.id);

    if (sentError || receivedError) {
      console.error('Conversations fetch error:', sentError || receivedError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Get unique user IDs
    const userIds = new Set<string>();
    sentMessages?.forEach((msg: any) => userIds.add(msg.receiver_id));
    receivedMessages?.forEach((msg: any) => userIds.add(msg.sender_id));

    // Get latest message for each conversation
    const conversations = await Promise.all(
      Array.from(userIds).map(async (otherUserId) => {
        const { data: latestMessage, error: latestError } = await supabase
          .from('direct_messages')
          .select(`
            *,
            sender:user_profiles!direct_messages_sender_id_fkey(display_name),
            receiver:user_profiles!direct_messages_receiver_id_fkey(display_name)
          `)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (latestError || !latestMessage) return null;

        // Count unread messages from this user
        const { count: unreadCount } = await supabase
          .from('direct_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', otherUserId)
          .eq('receiver_id', user.id)
          .eq('read', false);

        const otherUser = await supabase
          .from('user_profiles')
          .select('user_id, display_name, avatar_url')
          .eq('user_id', otherUserId)
          .single();

        return {
          otherUser: {
            id: otherUserId,
            name: otherUser.data?.display_name || 'Unknown User',
            avatar: otherUser.data?.avatar_url || "https://picsum.photos/seed/user1/100/100"
          },
          latestMessage: {
            content: latestMessage.content,
            created_at: latestMessage.created_at,
            isFromMe: latestMessage.sender_id === user.id
          },
          unreadCount: unreadCount || 0
        };
      })
    );

    // Filter out null conversations and sort by latest message
    const validConversations = conversations
      .filter((conv): conv is NonNullable<typeof conv> => conv !== null)
      .sort((a, b) => new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime());

    return NextResponse.json({ conversations: validConversations });

  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
