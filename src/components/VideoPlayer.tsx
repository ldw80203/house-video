import { useState, useEffect, useRef } from 'react'
import { getYouTubeEmbedUrl, getYouTubeThumbnail, extractYouTubeId } from '@/utils/youtube'

interface VideoPlayerProps {
  videoUrl: string
  autoPlay?: boolean
  muted?: boolean
  embedded?: boolean
  className?: string
}

export function VideoPlayer({
  videoUrl,
  autoPlay = true,
  muted = true,
  embedded = true,
  className = ''
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay || embedded)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isYouTube = extractYouTubeId(videoUrl) !== null
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(videoUrl) : null
  const thumbnailUrl = isYouTube ? getYouTubeThumbnail(videoUrl, 'maxres') : null

  useEffect(() => {
    if (embedded || autoPlay) {
      setIsPlaying(true)
    }
  }, [autoPlay, embedded, videoUrl])

  const handlePlay = () => {
    setIsPlaying(true)
    setShowPlayButton(false)
  }

  const handleVideoClick = () => {
    if (!embedded) {
      setShowPlayButton(!showPlayButton)
    }
  }

  // 處理本地上傳的影片
  if (!isYouTube) {
    return (
      <div className={`relative w-full h-full bg-black ${className}`}>
        <video
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={autoPlay}
          muted={muted}
          loop
          playsInline
          controls={!embedded}
          onClick={handleVideoClick}
        />
      </div>
    )
  }

  // YouTube 影片 - 內嵌模式
  if (embedded && isPlaying) {
    return (
      <div className={`relative w-full h-full bg-black ${className}`}>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={`${embedUrl}&autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${extractYouTubeId(videoUrl)}`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    )
  }

  // 非內嵌模式 - 顯示縮圖和播放按鈕
  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {isPlaying ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={`${embedUrl}&autoplay=1&mute=${muted ? 1 : 0}`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoaded(true)}
          />
        </>
      ) : (
        <>
          <img
            src={thumbnailUrl || ''}
            alt="影片縮圖"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
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
