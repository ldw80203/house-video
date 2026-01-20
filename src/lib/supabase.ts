import { createClient } from '@supabase/supabase-js'
import type { Property, PropertyFormData } from '@/types'

// Supabase 設定
// 請在 .env 檔案中設定這些值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============ 物件 CRUD ============

// 取得所有已發布的物件
export async function getPublishedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return data || []
}

// 取得單一物件
export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return null
  }

  return data
}

// 新增物件
export async function createProperty(formData: PropertyFormData): Promise<Property | null> {
  // 計算單坪價格
  const pricePerPing = formData.size > 0
    ? Math.round((formData.price / formData.size) * 10) / 10
    : 0

  const { data, error } = await supabase
    .from('properties')
    .insert([
      {
        ...formData,
        price_per_ping: pricePerPing,
        community_name: formData.community_name || null,
        line_id: formData.line_id || null,
        is_published: true,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating property:', error)
    return null
  }

  return data
}

// 更新物件
export async function updateProperty(id: string, formData: Partial<PropertyFormData>): Promise<Property | null> {
  const updates: Record<string, unknown> = { ...formData }

  // 如果有更新價格或坪數，重新計算單坪價格
  if (formData.price !== undefined || formData.size !== undefined) {
    const { data: current } = await supabase
      .from('properties')
      .select('price, size')
      .eq('id', id)
      .single()

    if (current) {
      const price = formData.price ?? current.price
      const size = formData.size ?? current.size
      updates.price_per_ping = size > 0 ? Math.round((price / size) * 10) / 10 : 0
    }
  }

  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating property:', error)
    return null
  }

  return data
}

// 刪除物件
export async function deleteProperty(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting property:', error)
    return false
  }

  return true
}

// 篩選物件
export async function filterProperties(options: {
  district?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  roomType?: string | null
}): Promise<Property[]> {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_published', true)

  if (options.district) {
    query = query.eq('district', options.district)
  }

  if (options.minPrice) {
    query = query.gte('price', options.minPrice)
  }

  if (options.maxPrice) {
    query = query.lte('price', options.maxPrice)
  }

  if (options.roomType) {
    query = query.eq('room_type', options.roomType)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error filtering properties:', error)
    return []
  }

  return data || []
}
