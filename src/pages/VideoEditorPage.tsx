import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

interface VideoState {
  file: File | null
  url: string
  duration: number
  currentTime: number
  isPlaying: boolean
  startTime: number
  endTime: number
}

export function VideoEditorPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [video, setVideo] = useState<VideoState>({
    file: null,
    url: '',
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    startTime: 0,
    endTime: 0
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [savedVideos, setSavedVideos] = useState<{ name: string; url: string }[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 載入已保存的影片
  useEffect(() => {
    loadSavedVideos()
  }, [])

  const loadSavedVideos = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .list('uploads', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

      if (error) throw error

      if (data) {
        const videos = data.map(file => ({
          name: file.name,
          url: supabase.storage.from('videos').getPublicUrl(`uploads/${file.name}`).data.publicUrl
        }))
        setSavedVideos(videos)
      }
    } catch (error) {
      console.error('載入影片列表失敗:', error)
    }
  }

  // 處理檔案選擇
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setMessage({ type: 'error', text: '請選擇影片檔案' })
      return
    }

    const url = URL.createObjectURL(file)
    setVideo(prev => ({
      ...prev,
      file,
      url,
      startTime: 0,
      endTime: 0,
      currentTime: 0,
      isPlaying: false
    }))
    setMessage(null)
  }

  // 影片載入完成
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      setVideo(prev => ({
        ...prev,
        duration,
        endTime: duration
      }))
    }
  }

  // 更新當前時間
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      setVideo(prev => ({ ...prev, currentTime }))

      // 如果超過結束時間，回到開始時間
      if (currentTime >= video.endTime && video.endTime > 0) {
        videoRef.current.currentTime = video.startTime
      }
    }
  }

  // 播放/暫停
  const togglePlay = () => {
    if (videoRef.current) {
      if (video.isPlaying) {
        videoRef.current.pause()
      } else {
        if (videoRef.current.currentTime < video.startTime) {
          videoRef.current.currentTime = video.startTime
        }
        videoRef.current.play()
      }
      setVideo(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
    }
  }

  // 設定開始時間
  const setStartTime = () => {
    if (videoRef.current) {
      setVideo(prev => ({ ...prev, startTime: videoRef.current!.currentTime }))
    }
  }

  // 設定結束時間
  const setEndTime = () => {
    if (videoRef.current) {
      setVideo(prev => ({ ...prev, endTime: videoRef.current!.currentTime }))
    }
  }

  // 跳轉到時間點
  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setVideo(prev => ({ ...prev, currentTime: time }))
    }
  }

  // 格式化時間
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 上傳影片到 Supabase
  const uploadVideo = async () => {
    if (!video.file) {
      setMessage({ type: 'error', text: '請先選擇影片' })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}_${video.file.name}`

      // 模擬上傳進度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const { error } = await supabase.storage
        .from('videos')
        .upload(`uploads/${fileName}`, video.file, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)

      if (error) throw error

      setUploadProgress(100)
      setMessage({ type: 'success', text: '影片上傳成功！' })

      // 重新載入影片列表
      await loadSavedVideos()

      // 清除編輯狀態
      setTimeout(() => {
        setVideo({
          file: null,
          url: '',
          duration: 0,
          currentTime: 0,
          isPlaying: false,
          startTime: 0,
          endTime: 0
        })
        setUploadProgress(0)
      }, 2000)

    } catch (error: unknown) {
      console.error('上傳失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '未知錯誤'
      setMessage({ type: 'error', text: `上傳失敗: ${errorMessage}` })
    } finally {
      setIsUploading(false)
    }
  }

  // 保存到本地
  const saveToLocal = () => {
    if (!video.url || !video.file) return

    const a = document.createElement('a')
    a.href = video.url
    a.download = video.file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setMessage({ type: 'success', text: '已保存到本地' })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 頂部導航 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-lg font-bold">影片編輯器</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        {/* 訊息提示 */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-xl ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* 影片預覽區 */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden mb-6">
          {video.url ? (
            <div className="relative">
              <video
                ref={videoRef}
                src={video.url}
                className="w-full aspect-video bg-black"
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setVideo(prev => ({ ...prev, isPlaying: true }))}
                onPause={() => setVideo(prev => ({ ...prev, isPlaying: false }))}
                playsInline
              />

              {/* 播放控制覆蓋層 */}
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
              >
                {!video.isPlaying && (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="aspect-video bg-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400 text-lg">點擊選擇影片檔案</p>
              <p className="text-gray-500 text-sm mt-2">支援 MP4, WebM, MOV 格式</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 影片已載入時顯示編輯控制 */}
        {video.url && (
          <>
            {/* 時間軸 */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>{formatTime(video.currentTime)}</span>
                <span>{formatTime(video.duration)}</span>
              </div>

              {/* 進度條 */}
              <div
                className="relative h-2 bg-gray-700 rounded-full cursor-pointer mb-4"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = (e.clientX - rect.left) / rect.width
                  seekTo(percent * video.duration)
                }}
              >
                {/* 裁剪範圍 */}
                <div
                  className="absolute h-full bg-blue-500/30 rounded-full"
                  style={{
                    left: `${(video.startTime / video.duration) * 100}%`,
                    width: `${((video.endTime - video.startTime) / video.duration) * 100}%`
                  }}
                />
                {/* 當前進度 */}
                <div
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{ width: `${(video.currentTime / video.duration) * 100}%` }}
                />
                {/* 播放頭 */}
                <div
                  className="absolute w-4 h-4 bg-white rounded-full -top-1 -translate-x-1/2 shadow-lg"
                  style={{ left: `${(video.currentTime / video.duration) * 100}%` }}
                />
              </div>

              {/* 裁剪控制 */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={setStartTime}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    設為起點
                  </button>
                  <span className="text-gray-400 text-sm">
                    {formatTime(video.startTime)}
                  </span>
                </div>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                >
                  {video.isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">
                    {formatTime(video.endTime)}
                  </span>
                  <button
                    onClick={setEndTime}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  >
                    設為終點
                  </button>
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={saveToLocal}
                className="flex items-center justify-center gap-2 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                保存到本地
              </button>

              <button
                onClick={uploadVideo}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-xl transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    上傳中 {uploadProgress}%
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    上傳到 APP
                  </>
                )}
              </button>
            </div>

            {/* 選擇其他影片 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 text-gray-400 hover:text-white transition-colors text-sm"
            >
              選擇其他影片
            </button>
          </>
        )}

        {/* 已上傳的影片列表 */}
        {savedVideos.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">已上傳的影片</h2>
            <div className="grid grid-cols-2 gap-4">
              {savedVideos.map((vid, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl overflow-hidden"
                >
                  <video
                    src={vid.url}
                    className="w-full aspect-video bg-black object-cover"
                    muted
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                  <div className="p-3">
                    <p className="text-sm text-gray-400 truncate">{vid.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default VideoEditorPage
