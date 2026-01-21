import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import {
  getChatRoomById,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToChatRoom,
} from '@/lib/chat'
import type { ChatRoom, ChatMessage } from '@/types'

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()

  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login')
      return
    }

    if (!roomId) {
      navigate('/chat')
      return
    }

    loadChatRoom()
    loadMessages()
  }, [roomId, user, authLoading, navigate])

  // 訂閱即時訊息
  useEffect(() => {
    if (!roomId) return

    const subscription = subscribeToChatRoom(roomId, (message) => {
      setMessages((prev) => [...prev, message])
      scrollToBottom()

      // 如果是別人發的訊息，標記為已讀
      if (user && message.sender_id !== user.id) {
        markMessagesAsRead(roomId, user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId, user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadChatRoom() {
    if (!roomId) return

    const data = await getChatRoomById(roomId)
    setRoom(data)
  }

  async function loadMessages() {
    if (!roomId || !user) return

    setIsLoading(true)
    try {
      const data = await getChatMessages(roomId)
      setMessages(data)
      // 標記為已讀
      await markMessagesAsRead(roomId, user.id)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!roomId || !user || !newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const message = await sendMessage(roomId, user.id, newMessage.trim())
      if (message) {
        // 即時訂閱會自動加入新訊息
        setNewMessage('')
        inputRef.current?.focus()
      }
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }

  const otherUser = room?.buyer_id === user?.id ? room?.agent_profile : room?.buyer_profile

  if (authLoading || isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">聊天室不存在</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* 頂部導航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate('/chat')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 用戶資訊 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {otherUser?.display_name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-900 truncate">
                  {otherUser?.display_name || '未知用戶'}
                </h2>
                <p className="text-xs text-gray-500 truncate">{room.property?.title}</p>
              </div>
            </div>
          </div>

          {/* 物件資訊按鈕 */}
          {room.property && (
            <button
              onClick={() => navigate(`/list`)}
              className="ml-2 px-3 py-1.5 text-sm text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors flex-shrink-0"
            >
              查看物件
            </button>
          )}
        </div>
      </header>

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender_id === user?.id

          return (
            <motion.div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 頭像（只顯示對方） */}
                {!isOwn && (
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {message.sender_profile?.display_name?.[0] || '?'}
                  </div>
                )}

                {/* 訊息氣泡 */}
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-brand-primary text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.message}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入欄 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="輸入訊息..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl
                     focus:ring-2 focus:ring-brand-primary focus:border-transparent
                     transition-all resize-none"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 bg-brand-primary text-white rounded-full
                     flex items-center justify-center
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-brand-primary/90 transition-all
                     active:scale-95 flex-shrink-0"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatRoomPage
