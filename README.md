# 影音看房

用短影音的方式找房子，支援登入及即時聊天功能。

## 功能特色

- 📱 短影音看房體驗（TikTok 風格）
- 🗺️ 地圖查找社區功能
- 📋 物件列表瀏覽
- 🔐 用戶註冊與登入
- 💬 即時聊天室功能
- 📞 一鍵撥號與 Line 聯繫
- 🎨 精美的 UI/UX 設計

## 快速開始

### 本地開發

```bash
npm install
npm run dev
```

### 環境變數設定

複製 `.env.example` 為 `.env`，填入你的 Supabase 資訊：

```
VITE_SUPABASE_URL=你的 Supabase URL
VITE_SUPABASE_ANON_KEY=你的 Supabase Anon Key
```

### 資料庫設定

1. 前往 [supabase.com](https://supabase.com) 建立專案
2. 啟用 Authentication：
   - 前往 Authentication > Settings
   - 啟用 Email provider
   - 設定 Site URL 和 Redirect URLs
3. 在 SQL Editor 執行 `supabase-schema.sql` 的完整內容
4. 啟用 Realtime（用於即時聊天）：
   - 前往 Database > Replication
   - 為 `chat_messages` 資料表啟用 Realtime
5. 前往 Project Settings > API 取得 URL 和 Key

## 部署到 Vercel

1. 推送到 GitHub
2. 前往 [vercel.com](https://vercel.com)
3. Import 你的 GitHub repo
4. 在環境變數設定中加入 Supabase URL 和 Key
5. 部署完成

## 使用流程

### 房仲端
1. 註冊並登入帳號
2. 拍攝房屋影片，上傳到 YouTube（設為不公開）
3. 進入 `/admin` 頁面新增物件
4. 填寫物件資訊並貼上 YouTube 網址
5. 發布後即可在 `/feed` 和 `/list` 查看
6. 等待買家透過聊天室聯繫

### 買家端
1. 瀏覽首頁或直接開始看房
2. 在 `/feed` 頁面滑動瀏覽短影音
3. 看到喜歡的物件可以：
   - 點擊「聯繫房仲」開啟聊天室（需登入）
   - 直接撥打電話
   - 透過 Line 聯繫
4. 在聊天室與房仲即時溝通

## 頁面說明

- `/` - 首頁（含導航選單）
- `/feed` - 短影音滑動看房
- `/list` - 物件列表
- `/admin` - 新增物件（管理員）
- `/login` - 登入/註冊頁面
- `/chat` - 聊天室列表
- `/chat/:roomId` - 聊天室對話頁面

## 技術架構

- **前端框架**: React 18 + TypeScript
- **路由**: React Router v6
- **狀態管理**: Zustand + React Context
- **UI 框架**: Tailwind CSS
- **動畫**: Framer Motion
- **後端服務**: Supabase
  - Authentication（用戶認證）
  - Database（PostgreSQL）
  - Realtime（即時通訊）
  - Storage（未來可擴展用於圖片上傳）

## 注意事項

1. **聊天功能**：需要先登入才能使用聊天室功能
2. **Realtime 訂閱**：確保在 Supabase 中啟用 `chat_messages` 資料表的 Realtime
3. **房仲 ID**：目前聊天功能使用虛擬房仲 ID，實際使用時需在物件資料中加入 `agent_id` 欄位
4. **Email 確認**：Supabase 預設需要 Email 確認，可在設定中關閉（僅開發環境）
