import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { getUserChatRooms } from '@/lib/chat'
import type { ChatRoom } from '@/types'

export function ChatListPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login')
      return
    }

    loadChatRooms()
  }, [user, authLoading, navigate])

  async function loadChatRooms() {
    if (!user) return

    setIsLoading(true)
    try {
      const rooms = await getUserChatRooms(user.id)
      setChatRooms(rooms)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days} 天前`
    } else {
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
    }
  }

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

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* 頂部導航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">聊天室</h1>
          </div>
        </div>
      </header>

      {/* 聊天室列表 */}
      <div className="flex-1 overflow-y-auto">
        {chatRooms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <svg
              className="w-20 h-20 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-2">還沒有聊天記錄</p>
            <p className="text-gray-500 text-sm mb-6">在物件頁面點擊「聯繫房仲」開始聊天</p>
            <button
              onClick={() => navigate('/feed')}
              className="px-6 py-3 bg-brand-primary text-white font-bold rounded-xl
                       shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              開始看房
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chatRooms.map((room, index) => {
              const otherUser = room.buyer_id === user?.id ? room.agent_profile : room.buyer_profile
              const property = room.property

              return (
                <motion.button
                  key={room.id}
                  onClick={() => navigate(`/chat/${room.id}`)}
                  className="w-full p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    {/* 頭像 */}
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {otherUser?.display_name?.[0] || '?'}
                    </div>

                    {/* 訊息內容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="font-bold text-gray-900 truncate">
                          {otherUser?.display_name || '未知用戶'}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTime(room.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {property?.title || '物件已刪除'}
                      </p>
                      {room.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {room.last_message.message}
                        </p>
                      )}
                    </div>

                    {/* 未讀數量 */}
                    {room.unread_count && room.unread_count > 0 && (
                      <div className="w-6 h-6 bg-brand-accent rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatListPage
