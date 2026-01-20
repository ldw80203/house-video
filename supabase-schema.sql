-- =============================================
-- Supabase 資料庫設定
-- 請在 Supabase Dashboard > SQL Editor 中執行此腳本
-- =============================================

-- 建立 properties 資料表
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  community_name TEXT,                    -- 社區名稱（選填）
  district TEXT NOT NULL,                 -- 地區
  address TEXT NOT NULL,                  -- 地址
  price NUMERIC NOT NULL,                 -- 總價（萬）
  size NUMERIC NOT NULL,                  -- 坪數
  price_per_ping NUMERIC NOT NULL,        -- 單坪價格（萬/坪）
  room_type TEXT NOT NULL,                -- 房型
  phone TEXT NOT NULL,                    -- 聯絡電話
  line_id TEXT,                           -- Line ID（選填）
  is_published BOOLEAN DEFAULT true,      -- 是否發布
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_room_type ON properties(room_type);
CREATE INDEX IF NOT EXISTS idx_properties_is_published ON properties(is_published);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- 啟用 Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 允許所有人讀取已發布的物件
CREATE POLICY "Allow public read access to published properties"
  ON properties
  FOR SELECT
  USING (is_published = true);

-- 允許所有人新增物件（之後可以改成需要登入）
CREATE POLICY "Allow public insert"
  ON properties
  FOR INSERT
  WITH CHECK (true);

-- 允許所有人更新物件（之後可以改成只能更新自己的）
CREATE POLICY "Allow public update"
  ON properties
  FOR UPDATE
  USING (true);

-- 允許所有人刪除物件（之後可以改成只能刪除自己的）
CREATE POLICY "Allow public delete"
  ON properties
  FOR DELETE
  USING (true);

-- =============================================
-- 測試資料（可選）
-- =============================================

-- INSERT INTO properties (title, video_url, community_name, district, address, price, size, price_per_ping, room_type, phone, line_id)
-- VALUES
--   ('信義區精美兩房', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '信義之星', '台北市信義區', '信義路五段100號', 1580, 28, 56.4, '2房1廳1衛', '0912-345-678', 'example_line'),
--   ('板橋捷運宅三房', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '板橋富貴', '新北市板橋區', '文化路一段200號', 1280, 35, 36.6, '3房2廳2衛', '0923-456-789', NULL);
