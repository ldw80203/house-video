# 更新日誌

## 2026-01-21 - 新增登入與聊天室功能

### 🎉 新功能

#### 用戶認證系統
- ✅ 新增用戶註冊與登入功能
- ✅ 整合 Supabase Authentication
- ✅ 建立用戶 Profile 系統
- ✅ 支援登入/登出狀態管理

#### 即時聊天室
- ✅ 新增聊天室列表頁面
- ✅ 新增即時對話功能
- ✅ 支援 Supabase Realtime 訂閱
- ✅ 訊息已讀/未讀狀態
- ✅ 買家與房仲即時溝通

#### UI/UX 改進
- ✅ 首頁新增導航選單
- ✅ 顯示登入狀態與聊天入口
- ✅ 物件資訊新增「聊天」按鈕
- ✅ 優化聯絡按鈕佈局

### 📁 新增檔案

#### 頁面 (Pages)
- `src/pages/LoginPage.tsx` - 登入/註冊頁面
- `src/pages/ChatListPage.tsx` - 聊天室列表
- `src/pages/ChatRoomPage.tsx` - 聊天對話頁面

#### Context & Hooks
- `src/contexts/AuthContext.tsx` - 認證狀態管理

#### API & Types
- `src/lib/chat.ts` - 聊天室 API 函數
- `src/types/index.ts` - 新增 Profile、ChatRoom、ChatMessage 類型

### 🔧 修改檔案

#### 資料庫
- `supabase-schema.sql` - 新增 profiles、chat_rooms、chat_messages 資料表

#### 應用程式核心
- `src/main.tsx` - 加入 AuthProvider
- `src/App.tsx` - 新增登入、聊天路由
- `src/pages/index.ts` - 匯出新頁面

#### 元件
- `src/components/PropertyInfo.tsx` - 新增聊天按鈕與功能
- `src/pages/HomePage.tsx` - 新增導航選單

#### 文檔
- `README.md` - 更新設定說明與功能介紹

### 🗄️ 資料庫更新

需要在 Supabase 執行的操作：

1. **執行 SQL Schema**
   ```sql
   -- 執行 supabase-schema.sql 中的新增內容
   -- 包含 profiles、chat_rooms、chat_messages 資料表
   ```

2. **啟用 Authentication**
   - 前往 Authentication > Settings
   - 啟用 Email provider

3. **啟用 Realtime**
   - 前往 Database > Replication
   - 為 `chat_messages` 資料表啟用 Realtime

### 📝 使用說明

#### 開發環境設定
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

#### 環境變數
確保 `.env` 檔案包含：
```
VITE_SUPABASE_URL=你的_Supabase_URL
VITE_SUPABASE_ANON_KEY=你的_Supabase_Anon_Key
```

### ⚠️ 注意事項

1. **房仲 ID 設定**
   - 目前使用虛擬 agent_id
   - 實際使用需在 properties 資料表新增 `agent_id` 欄位
   - 建議在新增物件時關聯當前登入用戶

2. **Email 確認**
   - Supabase 預設需要 Email 確認
   - 開發環境可在 Authentication > Settings 關閉

3. **Realtime 限制**
   - 免費版 Supabase 有 Realtime 連線數限制
   - 注意監控使用量

### 🚀 下一步建議

- [ ] 新增物件時自動設定 agent_id
- [ ] 支援圖片上傳功能
- [ ] 新增用戶個人資料頁面
- [ ] 支援推播通知（新訊息提醒）
- [ ] 新增物件收藏功能
- [ ] 優化手機版體驗
- [ ] 新增搜尋與篩選功能增強
