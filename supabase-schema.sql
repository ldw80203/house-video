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
-- 用戶資料表（擴展 Supabase Auth）
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 允許用戶讀取所有 profiles
CREATE POLICY "Allow public read access to profiles"
  ON profiles
  FOR SELECT
  USING (true);

-- 允許用戶更新自己的 profile
CREATE POLICY "Allow users to update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 允許用戶插入自己的 profile
CREATE POLICY "Allow users to insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 建立 profiles 更新時間觸發器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 聊天室資料表
-- =============================================

-- 聊天室表
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, buyer_id)
);

-- 聊天訊息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_chat_rooms_property_id ON chat_rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer_id ON chat_rooms(buyer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_agent_id ON chat_rooms(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- 啟用 RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 聊天室權限：只有參與者能查看
CREATE POLICY "Allow participants to view chat rooms"
  ON chat_rooms
  FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = agent_id);

-- 聊天室權限：買家可以建立聊天室
CREATE POLICY "Allow buyers to create chat rooms"
  ON chat_rooms
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- 聊天訊息權限：只有參與者能查看訊息
CREATE POLICY "Allow participants to view messages"
  ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.agent_id = auth.uid())
    )
  );

-- 聊天訊息權限：參與者可以發送訊息
CREATE POLICY "Allow participants to send messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.agent_id = auth.uid())
    )
  );

-- 聊天訊息權限：允許更新已讀狀態
CREATE POLICY "Allow participants to update messages"
  ON chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = chat_messages.room_id
      AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.agent_id = auth.uid())
    )
  );

-- 建立聊天室更新時間觸發器
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 測試資料（可選）
-- =============================================

-- INSERT INTO properties (title, video_url, community_name, district, address, price, size, price_per_ping, room_type, phone, line_id)
-- VALUES
--   ('信義區精美兩房', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '信義之星', '台北市信義區', '信義路五段100號', 1580, 28, 56.4, '2房1廳1衛', '0912-345-678', 'example_line'),
--   ('板橋捷運宅三房', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '板橋富貴', '新北市板橋區', '文化路一段200號', 1280, 35, 36.6, '3房2廳2衛', '0923-456-789', NULL);
