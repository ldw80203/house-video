import { create } from 'zustand'
import type { Property, FilterOptions } from '@/types'
import { getPublishedProperties, filterProperties } from '@/lib/supabase'

interface PropertyState {
  // 資料
  properties: Property[]
  currentIndex: number
  isLoading: boolean
  error: string | null

  // 篩選
  filters: FilterOptions

  // Actions
  fetchProperties: () => Promise<void>
  applyFilters: (filters: FilterOptions) => Promise<void>
  setCurrentIndex: (index: number) => void
  nextProperty: () => void
  prevProperty: () => void
  clearFilters: () => void
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  filters: {
    district: null,
    minPrice: null,
    maxPrice: null,
    roomType: null,
  },

  fetchProperties: async () => {
    set({ isLoading: true, error: null })
    try {
      const properties = await getPublishedProperties()
      set({ properties, isLoading: false, currentIndex: 0 })
    } catch (error) {
      set({ error: '無法載入物件', isLoading: false })
    }
  },

  applyFilters: async (filters) => {
    set({ isLoading: true, error: null, filters })
    try {
      const properties = await filterProperties(filters)
      set({ properties, isLoading: false, currentIndex: 0 })
    } catch (error) {
      set({ error: '篩選失敗', isLoading: false })
    }
  },

  setCurrentIndex: (index) => {
    const { properties } = get()
    if (index >= 0 && index < properties.length) {
      set({ currentIndex: index })
    }
  },

  nextProperty: () => {
    const { currentIndex, properties } = get()
    if (currentIndex < properties.length - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },

  prevProperty: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },

  clearFilters: () => {
    set({
      filters: {
        district: null,
        minPrice: null,
        maxPrice: null,
        roomType: null,
      },
    })
    get().fetchProperties()
  },
}))
