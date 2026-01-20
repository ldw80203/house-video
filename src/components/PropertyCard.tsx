import { motion } from 'framer-motion'
import type { Property } from '@/types'
import { formatPrice, formatPricePerPing, formatSize } from '@/utils/format'
import { getYouTubeThumbnail } from '@/utils/youtube'

interface PropertyCardProps {
  property: Property
  onClick?: () => void
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const thumbnailUrl = getYouTubeThumbnail(property.video_url, 'high')

  return (
    <motion.div
      className="card cursor-pointer group"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 影片縮圖 */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500
                     group-hover:scale-105"
          loading="lazy"
        />

        {/* 播放圖標 */}
        <div className="absolute inset-0 flex items-center justify-center
                        bg-black/0 group-hover:bg-black/30 transition-all duration-300">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center
                          opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100
                          transition-all duration-300 shadow-lg">
            <svg className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* 價格標籤 */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/80 backdrop-blur-sm
                        rounded-full text-white font-bold text-sm">
          {formatPrice(property.price)}
        </div>
      </div>

      {/* 物件資訊 */}
      <div className="p-4">
        {/* 標題 */}
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">
          {property.title}
        </h3>

        {/* 社區名稱 */}
        {property.community_name && (
          <p className="text-brand-accent text-sm font-medium mb-2">
            {property.community_name}
          </p>
        )}

        {/* 地區 */}
        <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {property.district}
        </p>

        {/* 房型 + 坪數 + 單價 */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="px-2 py-1 bg-gray-100 rounded-md">
            {property.room_type}
          </span>
          <span>{formatSize(property.size)}</span>
          <span className="text-gray-400">|</span>
          <span>{formatPricePerPing(property.price_per_ping)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default PropertyCard
