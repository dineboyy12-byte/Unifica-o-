import { supabase } from '@/lib/supabase';
import type { Conversation, Message, Profile } from '@/types';

export async function getOrCreateConversation(
  propertyId: string | null,
  participant1: string,
  participant2: string
): Promise<Conversation> {
  // Check if conversation already exists between these two users
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(`and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`)
    .maybeSingle();

  if (existing) {
    return existing as unknown as Conversation;
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      property_id: propertyId,
      participant_1: participant1,
      participant_2: participant2,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Conversation;
}

export async function getMyConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      property:properties(*),
      lastMessage:messages(
        id,
        content,
        sender_id,
        is_read,
        created_at
      )
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;

  const conversations = (data || []) as unknown as Conversation[];
  // Fetch the other participant's profile for each conversation
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const otherId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
      const { data: otherProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .maybeSingle();
      return {
        ...conv,
        otherParticipant: otherProfile as unknown as Profile,
        lastMessage: (conv.lastMessage as unknown as Message[] | undefined)?.[0],
      };
    })
  );

  return enriched;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as Message[];
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (error) throw error;

  // Update conversation's last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data as unknown as Message;
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .neq('sender_id', userId)
    .eq('is_read', false)
    .in('conversation_id', (
      await supabase
        .from('conversations')
        .select('id')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    ).data?.map((c) => c.id) || []);

  if (error) return 0;
  return count || 0;
}
