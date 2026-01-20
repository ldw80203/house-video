import { useState, useEffect } from 'react'
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '@/utils/youtube'

interface VideoPlayerProps {
  videoUrl: string
  autoPlay?: boolean
  className?: string
}

export function VideoPlayer({ videoUrl, autoPlay = false, className = '' }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isLoaded, setIsLoaded] = useState(false)

  const embedUrl = getYouTubeEmbedUrl(videoUrl)
  const thumbnailUrl = getYouTubeThumbnail(videoUrl, 'maxres')

  // 當 autoPlay 改變時更新狀態
  useEffect(() => {
    setIsPlaying(autoPlay)
  }, [autoPlay])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {isPlaying ? (
        <>
          {/* 載入中的遮罩 */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* YouTube iframe */}
          <iframe
            src={`${embedUrl}&autoplay=1&mute=0`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
          />
        </>
      ) : (
        <>
          {/* 縮圖 */}
          <img
            src={thumbnailUrl}
            alt="影片縮圖"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />

          {/* 播放按鈕 */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30
                       transition-all duration-300 hover:bg-black/40 group"
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center
                          shadow-lg transition-transform duration-300 group-hover:scale-110">
              <svg
                className="w-8 h-8 text-gray-900 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        </>
      )}
    </div>
  )
}

export default VideoPlayer
