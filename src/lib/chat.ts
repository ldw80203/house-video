import { supabase } from './supabase'
import type { ChatRoom, ChatMessage } from '@/types'

// ============ 聊天室 API ============

// 取得或建立聊天室
export async function getOrCreateChatRoom(
  propertyId: string,
  buyerId: string,
  agentId: string
): Promise<ChatRoom | null> {
  try {
    // 先檢查是否已存在
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('property_id', propertyId)
      .eq('buyer_id', buyerId)
      .single()

    if (existing) return existing

    // 不存在則建立新的
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert([
        {
          property_id: propertyId,
          buyer_id: buyerId,
          agent_id: agentId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('建立聊天室失敗:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('取得聊天室失敗:', error)
    return null
  }
}

// 取得用戶的所有聊天室
export async function getUserChatRooms(userId: string): Promise<ChatRoom[]> {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        property:properties(*),
        buyer_profile:profiles!chat_rooms_buyer_id_fkey(*),
        agent_profile:profiles!chat_rooms_agent_id_fkey(*)
      `)
      .or(`buyer_id.eq.${userId},agent_id.eq.${userId}`)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('取得聊天室列表失敗:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('取得聊天室列表失敗:', error)
    return []
  }
}

// 取得聊天室詳情
export async function getChatRoomById(roomId: string): Promise<ChatRoom | null> {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        property:properties(*),
        buyer_profile:profiles!chat_rooms_buyer_id_fkey(*),
        agent_profile:profiles!chat_rooms_agent_id_fkey(*)
      `)
      .eq('id', roomId)
      .single()

    if (error) {
      console.error('取得聊天室詳情失敗:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('取得聊天室詳情失敗:', error)
    return null
  }
}

// ============ 訊息 API ============

// 取得聊天室的所有訊息
export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender_profile:profiles(*)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('取得訊息失敗:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('取得訊息失敗:', error)
    return []
  }
}

// 發送訊息
export async function sendMessage(
  roomId: string,
  senderId: string,
  message: string
): Promise<ChatMessage | null> {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          room_id: roomId,
          sender_id: senderId,
          message,
        },
      ])
      .select(`
        *,
        sender_profile:profiles(*)
      `)
      .single()

    if (error) {
      console.error('發送訊息失敗:', error)
      return null
    }

    // 更新聊天室的 updated_at
    await supabase
      .from('chat_rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId)

    return data
  } catch (error) {
    console.error('發送訊息失敗:', error)
    return null
  }
}

// 標記訊息為已讀
export async function markMessagesAsRead(
  roomId: string,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .eq('is_read', false)
  } catch (error) {
    console.error('標記已讀失敗:', error)
  }
}

// 訂閱聊天室新訊息
export function subscribeToChatRoom(
  roomId: string,
  onMessage: (message: ChatMessage) => void
) {
  const subscription = supabase
    .channel(`chat_room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      },
      async (payload) => {
        // 取得發送者資料
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', payload.new.sender_id)
          .single()

        onMessage({
          ...(payload.new as ChatMessage),
          sender_profile: profile || undefined,
        })
      }
    )
    .subscribe()

  return subscription
}
