import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePropertyStore } from '@/store/usePropertyStore'
import { PropertyCard } from '@/components/PropertyCard'
import { FilterPanel } from '@/components/FilterPanel'

export function ListPage() {
  const navigate = useNavigate()
  const { properties, isLoading, fetchProperties, filters, setCurrentIndex } = usePropertyStore()
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const handlePropertyClick = (index: number) => {
    setCurrentIndex(index)
    navigate('/feed')
  }

  // 計算有效的篩選條件數量
  const activeFilterCount = [
    filters.district,
    filters.minPrice,
    filters.maxPrice,
    filters.roomType,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-14 flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="font-bold text-gray-900">影音看房</span>
            </button>

            {/* 篩選按鈕 */}
            <button
              onClick={() => setShowFilter(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full
                         text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium">篩選</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-brand-accent text-white text-xs font-bold
                                 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 結果統計 */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            共 <span className="font-bold text-gray-900">{properties.length}</span> 筆物件
          </p>

          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-brand-accent font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新增物件
          </button>
        </div>

        {/* 載入中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-gray-200 border-t-brand-accent rounded-full animate-spin" />
          </div>
        )}

        {/* 空狀態 */}
        {!isLoading && properties.length === 0 && (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-gray-500 mb-4">找不到符合條件的物件</p>
            <button
              onClick={() => navigate('/admin')}
              className="btn-primary"
            >
              新增第一個物件
            </button>
          </div>
        )}

        {/* 物件列表 */}
        {!isLoading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => handlePropertyClick(index)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 浮動影音按鈕 */}
      {properties.length > 0 && (
        <motion.button
          className="fixed bottom-6 right-6 w-14 h-14 bg-brand-primary text-white
                     rounded-full shadow-lg flex items-center justify-center z-30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/feed')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.button>
      )}

      {/* 篩選面板 */}
      <FilterPanel isOpen={showFilter} onClose={() => setShowFilter(false)} />
    </div>
  )
}

export default ListPage
