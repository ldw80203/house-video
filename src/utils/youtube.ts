/**
 * YouTube 相關工具函數
 */

// 從 YouTube URL 提取影片 ID
export function extractYouTubeId(url: string): string | null {
  if (!url) return null

  // 支援的格式：
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/v/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// 生成 YouTube 嵌入 URL
export function getYouTubeEmbedUrl(videoIdOrUrl: string): string {
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl

  // 參數說明：
  // - autoplay=1: 自動播放
  // - mute=1: 靜音（自動播放需要）
  // - loop=1: 循環播放
  // - playlist=VIDEO_ID: 循環播放需要
  // - controls=1: 顯示控制項
  // - modestbranding=1: 減少 YouTube logo
  // - rel=0: 不顯示相關影片
  // - playsinline=1: 在 iOS 上內嵌播放

  const params = new URLSearchParams({
    autoplay: '0',
    mute: '0',
    loop: '0',
    controls: '1',
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
  })

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

// 生成 YouTube 縮圖 URL
export function getYouTubeThumbnail(
  videoIdOrUrl: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl

  const qualityMap = {
    default: 'default',      // 120x90
    medium: 'mqdefault',     // 320x180
    high: 'hqdefault',       // 480x360
    maxres: 'maxresdefault', // 1280x720
  }

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

// 驗證 YouTube URL 是否有效
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}
