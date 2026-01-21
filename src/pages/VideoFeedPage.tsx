import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePropertyStore } from '@/store/usePropertyStore'
import { VideoPlayer } from '@/components/VideoPlayer'
import { PropertyInfo } from '@/components/PropertyInfo'
import { FilterPanel } from '@/components/FilterPanel'

export function VideoFeedPage() {
  const navigate = useNavigate()
  const {
    properties,
    currentIndex,
    isLoading,
    fetchProperties,
    nextProperty,
    prevProperty,
    setCurrentIndex,
  } = usePropertyStore()

  const [showInfo, setShowInfo] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [direction, setDirection] = useState<'up' | 'down'>('up')

  const containerRef = useRef<HTMLDivElement>(null)

  // 載入資料
  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // 禁用頁面滾動（只在影片頁）
  useEffect(() => {
    document.body.classList.add('video-feed-page')
    return () => {
      document.body.classList.remove('video-feed-page')
    }
  }, [])

  // 處理滑動
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50
      const velocity = info.velocity.y

      if (info.offset.y < -threshold || velocity < -500) {
        // 向上滑 → 下一個
        if (currentIndex < properties.length - 1) {
          setDirection('up')
          nextProperty()
        }
      } else if (info.offset.y > threshold || velocity > 500) {
        // 向下滑 → 上一個
        if (currentIndex > 0) {
          setDirection('down')
          prevProperty()
        }
      }
    },
    [currentIndex, properties.length, nextProperty, prevProperty]
  )

  // 鍵盤控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        if (currentIndex > 0) {
          setDirection('down')
          prevProperty()
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        if (currentIndex < properties.length - 1) {
          setDirection('up')
          nextProperty()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, properties.length, nextProperty, prevProperty])

  const currentProperty = properties[currentIndex]

  // 載入中
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70">載入中...</p>
        </div>
      </div>
    )
  }

  // 沒有物件
  if (properties.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-black px-6">
        <svg
          className="w-20 h-20 text-white/30 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <p className="text-white/70 text-lg mb-6">還沒有物件</p>
        <button
          onClick={() => navigate('/admin')}
          className="btn-primary"
        >
          新增第一個物件
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full bg-black relative overflow-hidden">
      {/* 影片內容 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentProperty.id}
          className="absolute inset-0"
          initial={{ y: direction === 'up' ? '100%' : '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: direction === 'up' ? '-100%' : '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {/* 影片播放器 */}
          <VideoPlayer videoUrl={currentProperty.video_url} />

          {/* 漸層遮罩 */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/70" />

          {/* 物件資訊 */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-4 pb-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <PropertyInfo property={currentProperty} compact />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* 右側操作列 */}
      <div className="absolute right-4 bottom-40 flex flex-col items-center gap-6 z-20">
        {/* 顯示/隱藏資訊 */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full
                     flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showInfo ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            )}
          </svg>
        </button>

        {/* 分享 */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: currentProperty.title,
                url: window.location.href,
              })
            }
          }}
          className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full
                     flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {/* 進度指示器 */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
        {properties.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 'up' : 'down')
              setCurrentIndex(index)
            }}
            className={`w-1 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'h-6 bg-white'
                : 'h-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* 頂部導航 */}
      <header className="absolute top-0 left-0 right-0 z-20 safe-area-inset-top">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/home')}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full
                       flex items-center justify-center text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <span className="text-white font-medium">
            {currentIndex + 1} / {properties.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full
                         flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setShowFilter(true)}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full
                         flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 篩選面板 */}
      <FilterPanel isOpen={showFilter} onClose={() => setShowFilter(false)} />

      {/* 滑動提示（首次使用） */}
      {currentIndex === 0 && (
        <motion.div
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10
                     text-white/70 text-sm flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </motion.div>
          <span>上滑看更多</span>
        </motion.div>
      )}
    </div>
  )
}

export default VideoFeedPage
