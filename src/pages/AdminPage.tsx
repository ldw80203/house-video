import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { createProperty, supabase } from '@/lib/supabase'
import { isValidYouTubeUrl, getYouTubeThumbnail } from '@/utils/youtube'
import { DISTRICTS, ROOM_TYPES } from '@/types'
import type { PropertyFormData } from '@/types'

type VideoSource = 'youtube' | 'upload'

const initialFormData: PropertyFormData = {
  title: '',
  video_url: '',
  community_name: '',
  district: '',
  address: '',
  price: 0,
  size: 0,
  room_type: '',
  phone: '',
  line_id: '',
}

export function AdminPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 影片相關狀態
  const [videoSource, setVideoSource] = useState<VideoSource>('upload')
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null)
  const [localVideoUrl, setLocalVideoUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // 計算單坪價格預覽
  const pricePerPing = formData.size > 0
    ? (formData.price / formData.size).toFixed(1)
    : '0'

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'size' ? Number(value) || 0 : value,
    }))
    setError(null)
  }

  // 處理本地影片選擇
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      setError('請選擇影片檔案')
      return
    }

    // 清除舊的 URL
    if (localVideoUrl) {
      URL.revokeObjectURL(localVideoUrl)
    }

    const url = URL.createObjectURL(file)
    setLocalVideoFile(file)
    setLocalVideoUrl(url)
    setError(null)
  }

  // 上傳影片到 Supabase Storage
  const uploadVideoToStorage = async (): Promise<string | null> => {
    if (!localVideoFile) return null

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const timestamp = Date.now()
      const extension = localVideoFile.name.split('.').pop() || 'mp4'
      const fileName = `${timestamp}.${extension}`

      // 模擬上傳進度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(`uploads/${fileName}`, localVideoFile, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)

      if (uploadError) throw uploadError

      // 取得公開 URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(`uploads/${fileName}`)

      setUploadProgress(100)
      return urlData.publicUrl

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '未知錯誤'
      setError(`影片上傳失敗: ${errorMessage}`)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return '請輸入標題'

    if (videoSource === 'youtube') {
      if (!formData.video_url.trim()) return '請輸入 YouTube 網址'
      if (!isValidYouTubeUrl(formData.video_url)) return '請輸入有效的 YouTube 網址'
    } else {
      if (!localVideoFile) return '請選擇要上傳的影片'
    }

    if (!formData.district) return '請選擇地區'
    if (!formData.address.trim()) return '請輸入地址'
    if (formData.price <= 0) return '請輸入有效的價格'
    if (formData.size <= 0) return '請輸入有效的坪數'
    if (!formData.room_type) return '請選擇房型'
    if (!formData.phone.trim()) return '請輸入聯絡電話'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let videoUrl = formData.video_url

      // 如果是上傳模式，先上傳影片
      if (videoSource === 'upload') {
        const uploadedUrl = await uploadVideoToStorage()
        if (!uploadedUrl) {
          setIsSubmitting(false)
          return
        }
        videoUrl = uploadedUrl
      }

      // 建立物件
      const result = await createProperty({
        ...formData,
        video_url: videoUrl,
      })

      if (result) {
        setSuccess(true)
        setFormData(initialFormData)
        setLocalVideoFile(null)
        setLocalVideoUrl('')
        setUploadProgress(0)
        // 3 秒後導航到首頁
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        setError('新增失敗，請稍後再試')
      }
    } catch (err) {
      setError('發生錯誤，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* 頂部導航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="font-bold text-gray-900">新增物件</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* 表單 */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <form onSubmit={handleSubmit} className="space-y-6 mb-24">
          {/* 成功提示 */}
          {success && (
            <motion.div
              className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              物件新增成功！即將返回首頁...
            </motion.div>
          )}

          {/* 錯誤提示 */}
          {error && (
            <motion.div
              className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* 影片資訊 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">影片資訊</h2>

            {/* 影片來源選擇 */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setVideoSource('upload')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  videoSource === 'upload'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                上傳影片
              </button>
              <button
                type="button"
                onClick={() => setVideoSource('youtube')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors ${
                  videoSource === 'youtube'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                YouTube 連結
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  標題 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="例：信義區精美裝潢兩房"
                  className="input-field"
                />
              </div>

              {videoSource === 'youtube' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube 網址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input-field"
                  />
                  {formData.video_url && isValidYouTubeUrl(formData.video_url) && (
                    <div className="mt-3 rounded-xl overflow-hidden">
                      <img
                        src={getYouTubeThumbnail(formData.video_url, 'high')}
                        alt="影片預覽"
                        className="w-full aspect-video object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    上傳影片 <span className="text-red-500">*</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {localVideoUrl ? (
                    <div className="space-y-3">
                      <div className="rounded-xl overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          src={localVideoUrl}
                          className="w-full aspect-video object-contain"
                          controls
                          playsInline
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 truncate flex-1">
                          {localVideoFile?.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                          更換影片
                        </button>
                      </div>
                      {isUploading && (
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-500 text-center">
                            上傳中 {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                    >
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600 font-medium">點擊選擇影片</p>
                      <p className="text-gray-400 text-sm mt-1">支援 MP4, WebM, MOV 格式</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* 物件資訊 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">物件資訊</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  社區名稱
                </label>
                <input
                  type="text"
                  name="community_name"
                  value={formData.community_name}
                  onChange={handleChange}
                  placeholder="例：信義之星（選填）"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地區 <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">請選擇地區</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="例：信義路五段100號"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    總價（萬）<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleChange}
                    placeholder="1580"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    坪數 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size || ''}
                    onChange={handleChange}
                    placeholder="28"
                    step="0.1"
                    className="input-field"
                  />
                </div>
              </div>

              {/* 單坪價格預覽 */}
              {formData.price > 0 && formData.size > 0 && (
                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  單坪價格：{pricePerPing} 萬/坪
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  房型 <span className="text-red-500">*</span>
                </label>
                <select
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">請選擇房型</option>
                  {ROOM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* 聯絡資訊 */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">聯絡資訊</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡電話 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912-345-678"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Line ID
                </label>
                <input
                  type="text"
                  name="line_id"
                  value={formData.line_id}
                  onChange={handleChange}
                  placeholder="your_line_id（選填）"
                  className="input-field"
                />
              </div>
            </div>
          </section>

          {/* 提交按鈕 - 固定在底部 */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20">
            <div className="max-w-2xl mx-auto">
              <motion.button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl text-lg
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                           hover:bg-gray-800 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting || isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isUploading ? `上傳中 ${uploadProgress}%` : '新增中...'}
                  </span>
                ) : (
                  '新增物件'
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminPage
