import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePropertyStore } from '@/store/usePropertyStore'
import { DISTRICTS, ROOM_TYPES } from '@/types'

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const { filters, applyFilters, clearFilters } = usePropertyStore()

  const [localFilters, setLocalFilters] = useState({
    district: filters.district || '',
    minPrice: filters.minPrice?.toString() || '',
    maxPrice: filters.maxPrice?.toString() || '',
    roomType: filters.roomType || '',
  })

  const handleApply = () => {
    applyFilters({
      district: localFilters.district || null,
      minPrice: localFilters.minPrice ? Number(localFilters.minPrice) : null,
      maxPrice: localFilters.maxPrice ? Number(localFilters.maxPrice) : null,
      roomType: localFilters.roomType || null,
    })
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({
      district: '',
      minPrice: '',
      maxPrice: '',
      roomType: '',
    })
    clearFilters()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 面板 */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50
                       max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 拖曳指示器 */}
            <div className="flex justify-center py-3 sticky top-0 bg-white">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-8">
              {/* 標題 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">篩選條件</h2>
                <button
                  onClick={handleClear}
                  className="text-brand-accent font-medium"
                >
                  清除全部
                </button>
              </div>

              {/* 地區 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地區
                </label>
                <select
                  value={localFilters.district}
                  onChange={(e) => setLocalFilters({ ...localFilters, district: e.target.value })}
                  className="input-field"
                >
                  <option value="">全部地區</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* 價格範圍 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  價格範圍（萬）
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="最低"
                    value={localFilters.minPrice}
                    onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                    className="input-field"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="最高"
                    value={localFilters.maxPrice}
                    onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              {/* 快速價格選擇 */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '500萬以下', min: '', max: '500' },
                    { label: '500-1000萬', min: '500', max: '1000' },
                    { label: '1000-1500萬', min: '1000', max: '1500' },
                    { label: '1500-2000萬', min: '1500', max: '2000' },
                    { label: '2000萬以上', min: '2000', max: '' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setLocalFilters({
                        ...localFilters,
                        minPrice: option.min,
                        maxPrice: option.max,
                      })}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all
                        ${localFilters.minPrice === option.min && localFilters.maxPrice === option.max
                          ? 'bg-brand-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 房型 */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  房型
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROOM_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setLocalFilters({
                        ...localFilters,
                        roomType: localFilters.roomType === type ? '' : type,
                      })}
                      className={`px-4 py-2 rounded-full text-sm transition-all
                        ${localFilters.roomType === type
                          ? 'bg-brand-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* 套用按鈕 */}
              <motion.button
                className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl text-lg"
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
              >
                套用篩選
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FilterPanel
