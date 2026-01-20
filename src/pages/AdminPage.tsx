import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { createProperty } from '@/lib/supabase'
import { isValidYouTubeUrl } from '@/utils/youtube'
import { DISTRICTS, ROOM_TYPES } from '@/types'
import type { PropertyFormData } from '@/types'

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
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return '請輸入標題'
    if (!formData.video_url.trim()) return '請輸入 YouTube 網址'
    if (!isValidYouTubeUrl(formData.video_url)) return '請輸入有效的 YouTube 網址'
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
      const result = await createProperty(formData)
      if (result) {
        setSuccess(true)
        setFormData(initialFormData)
        // 3 秒後重置成功狀態
        setTimeout(() => setSuccess(false), 3000)
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
          <div className="w-16" /> {/* 佔位 */}
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
              物件新增成功！
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
                <p className="text-xs text-gray-500 mt-1">
                  請先將影片上傳至 YouTube（可設為不公開），再貼上網址
                </p>
              </div>
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
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl text-lg
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                           hover:bg-gray-800 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? '新增中...' : '新增物件'}
              </motion.button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

export default AdminPage
