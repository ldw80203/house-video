import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getOrCreateChatRoom } from '@/lib/chat'
import type { Property } from '@/types'
import { formatPrice, formatPricePerPing, formatSize, formatPhone } from '@/utils/format'

interface PropertyInfoProps {
  property: Property
  compact?: boolean
}

export function PropertyInfo({ property, compact = false }: PropertyInfoProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleCall = () => {
    window.location.href = `tel:${property.phone}`
  }

  const handleLine = () => {
    if (property.line_id) {
      window.open(`https://line.me/ti/p/${property.line_id}`, '_blank')
    }
  }

  const handleChat = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    // 假設 property 裡沒有 agent_id，我們暫時用一個虛擬的房仲 ID
    // 實際使用時，需要在 property 裡加入 agent_id 欄位
    const agentId = 'agent-id-placeholder'

    const room = await getOrCreateChatRoom(property.id, user.id, agentId)
    if (room) {
      navigate(`/chat/${room.id}`)
    }
  }

  if (compact) {
    return (
      <div className="text-white">
        {/* 價格 */}
        <div className="text-3xl font-bold mb-1">
          {formatPrice(property.price)}
        </div>

        {/* 標題 */}
        <h2 className="text-xl font-medium mb-2 line-clamp-2">
          {property.title}
        </h2>

        {/* 社區名稱 */}
        {property.community_name && (
          <p className="text-blue-400 font-medium mb-2">
            {property.community_name}
          </p>
        )}

        {/* 基本資訊 */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/80 mb-4">
          <span className="px-2 py-1 bg-white/20 rounded-md backdrop-blur-sm">
            {property.room_type}
          </span>
          <span>{formatSize(property.size)}</span>
          <span>·</span>
          <span>{formatPricePerPing(property.price_per_ping)}</span>
        </div>

        {/* 地址 */}
        <div className="flex items-start gap-2 text-sm text-white/70 mb-4">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span>{property.district} {property.address}</span>
        </div>

        {/* 聯絡按鈕 */}
        <div className="flex gap-2">
          <motion.button
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4
                       bg-brand-accent text-white font-medium rounded-full"
            whileTap={{ scale: 0.95 }}
            onClick={handleChat}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            聊天
          </motion.button>

          <motion.button
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4
                       bg-green-500 text-white font-medium rounded-full"
            whileTap={{ scale: 0.95 }}
            onClick={handleCall}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            電話
          </motion.button>

          {property.line_id && (
            <motion.button
              className="flex items-center justify-center gap-2 py-3 px-4
                         bg-[#00B900] text-white font-medium rounded-full"
              whileTap={{ scale: 0.95 }}
              onClick={handleLine}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>
    )
  }

  // 完整版資訊
  return (
    <div className="bg-white rounded-t-3xl p-6">
      {/* 拖曳指示器 */}
      <div className="flex justify-center mb-4">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* 價格 */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold text-gray-900">
          {formatPrice(property.price)}
        </span>
        <span className="text-gray-500">
          {formatPricePerPing(property.price_per_ping)}
        </span>
      </div>

      {/* 標題 */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {property.title}
      </h2>

      {/* 社區名稱 */}
      {property.community_name && (
        <p className="text-brand-accent font-medium mb-3">
          {property.community_name}
        </p>
      )}

      {/* 標籤列 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {property.room_type}
        </span>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
          {formatSize(property.size)}
        </span>
      </div>

      {/* 地址 */}
      <div className="flex items-start gap-2 text-gray-600 mb-6">
        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <span>{property.district} {property.address}</span>
      </div>

      {/* 聯絡按鈕 */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          className="col-span-2 flex items-center justify-center gap-2 py-4 px-4
                     bg-brand-accent text-white font-bold rounded-2xl text-lg"
          whileTap={{ scale: 0.95 }}
          onClick={handleChat}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          聯繫房仲
        </motion.button>

        <motion.button
          className="flex items-center justify-center gap-2 py-4 px-4
                     bg-green-500 text-white font-bold rounded-2xl text-lg"
          whileTap={{ scale: 0.95 }}
          onClick={handleCall}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          電話
        </motion.button>

        {property.line_id && (
          <motion.button
            className="flex items-center justify-center gap-2 py-4 px-4
                       bg-[#00B900] text-white font-bold rounded-2xl text-lg"
            whileTap={{ scale: 0.95 }}
            onClick={handleLine}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default PropertyInfo
