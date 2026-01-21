// 物件資料類型
export interface Property {
  id: string
  title: string
  video_url: string
  community_name: string | null  // 社區名稱（選填）
  district: string               // 地區（如：台北市信義區）
  address: string
  price: number                  // 總價（萬）
  size: number                   // 坪數
  price_per_ping: number         // 單坪價格（萬/坪，自動計算）
  room_type: string              // 房型（如：2房1廳1衛）
  phone: string
  line_id: string | null
  created_at: string
  is_published: boolean
}

// 新增物件表單
export interface PropertyFormData {
  title: string
  video_url: string
  community_name: string
  district: string
  address: string
  price: number
  size: number
  room_type: string
  phone: string
  line_id: string
}

// 篩選條件
export interface FilterOptions {
  district: string | null
  minPrice: number | null
  maxPrice: number | null
  roomType: string | null
}

// 地區選項
export const DISTRICTS = [
  '台北市中正區',
  '台北市大同區',
  '台北市中山區',
  '台北市松山區',
  '台北市大安區',
  '台北市萬華區',
  '台北市信義區',
  '台北市士林區',
  '台北市北投區',
  '台北市內湖區',
  '台北市南港區',
  '台北市文山區',
  '新北市板橋區',
  '新北市三重區',
  '新北市中和區',
  '新北市永和區',
  '新北市新莊區',
  '新北市新店區',
  '新北市土城區',
  '新北市蘆洲區',
  '新北市汐止區',
  '新北市樹林區',
  '新北市淡水區',
  '新北市林口區',
  '桃園市桃園區',
  '桃園市中壢區',
  '桃園市八德區',
  '桃園市龜山區',
] as const

// 房型選項
export const ROOM_TYPES = [
  '套房',
  '1房1廳1衛',
  '2房1廳1衛',
  '2房2廳1衛',
  '2房2廳2衛',
  '3房2廳1衛',
  '3房2廳2衛',
  '4房2廳2衛',
] as const

// ============ 認證相關 ============

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

// ============ 聊天室相關 ============

export interface ChatRoom {
  id: string
  property_id: string
  buyer_id: string
  agent_id: string
  created_at: string
  updated_at: string
  property?: Property
  buyer_profile?: Profile
  agent_profile?: Profile
  last_message?: ChatMessage
  unread_count?: number
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
  sender_profile?: Profile
}
