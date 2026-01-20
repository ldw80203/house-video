# 影音看房

用短影音的方式找房子。

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
2. 在 SQL Editor 執行 `supabase-schema.sql` 的內容
3. 前往 Project Settings > API 取得 URL 和 Key

## 部署到 Vercel

1. 推送到 GitHub
2. 前往 [vercel.com](https://vercel.com)
3. Import 你的 GitHub repo
4. 在環境變數設定中加入 Supabase URL 和 Key
5. 部署完成

## 使用流程

1. 拍攝房屋影片，上傳到 YouTube（設為不公開）
2. 進入 `/admin` 頁面新增物件
3. 填寫物件資訊並貼上 YouTube 網址
4. 發布後即可在 `/feed` 和 `/list` 查看

## 頁面說明

- `/` - 首頁
- `/feed` - 短影音滑動看房
- `/list` - 物件列表
- `/admin` - 新增物件（管理員）
