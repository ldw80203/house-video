# 部署指南

## 步驟 1：準備 Git

```bash
cd c:\Users\環球\Desktop\house-video

# 初始化 Git（如果還沒有）
git init

# 加入所有檔案
git add .

# 建立第一個 commit
git commit -m "Initial commit: 影音看房應用"
```

## 步驟 2：推送到 GitHub

### 方法 A：使用 GitHub Desktop（推薦新手）
1. 下載並安裝 [GitHub Desktop](https://desktop.github.com/)
2. 開啟 GitHub Desktop，選擇「Add Existing Repository」
3. 選擇 `c:\Users\環球\Desktop\house-video` 資料夾
4. 點擊「Publish repository」
5. 取消勾選「Keep this code private」（或保持私有）
6. 點擊「Publish repository」

### 方法 B：使用指令（如果你熟悉 Git）
```bash
# 在 GitHub 建立新 repo，然後執行：
git remote add origin https://github.com/你的帳號/house-video.git
git branch -M main
git push -u origin main
```

## 步驟 3：部署到 Vercel

1. 前往 [vercel.com](https://vercel.com)
2. 點擊「Sign Up」用 GitHub 帳號登入
3. 點擊「Add New Project」
4. 選擇剛才推送的 `house-video` repo
5. Vercel 會自動偵測這是 Vite 專案
6. **重要**：在「Environment Variables」加入：
   ```
   VITE_SUPABASE_URL = https://cnnfgaciagIrwoyocoeg.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNubmZnYWNpYWdscndveW9jb2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTE0MDMsImV4cCI6MjA4NDQ2NzQwM30.LWaq0eITeatOI9V6ItZoyJqDg6H0hvFfXD9b12fRgPo
   ```
7. 點擊「Deploy」

## 步驟 4：等待部署完成

- 第一次部署約需 2-3 分鐘
- 完成後會給你一個網址，例如：`house-video.vercel.app`

## 步驟 5：測試

1. 開啟部署後的網址
2. 前往 `/admin` 新增一個測試物件
3. 檢查 `/feed` 和 `/list` 是否正常顯示

## 之後更新程式碼

每次修改程式碼後：

```bash
git add .
git commit -m "你的更新說明"
git push
```

Vercel 會自動重新部署，約 1-2 分鐘後更新就會上線。

## 自訂網域（選填）

如果你有自己的網域：

1. 在 Vercel 專案設定中點擊「Domains」
2. 輸入你的網域（如：house.你的網域.com）
3. 按照指示在你的網域商設定 DNS
4. 等待 DNS 生效（約 5 分鐘到 24 小時）

## 疑難排解

### 部署後白畫面
- 檢查環境變數是否正確設定
- 檢查瀏覽器 Console 是否有錯誤

### 無法新增物件
- 檢查 Supabase 資料庫是否正確建立
- 檢查 RLS 政策是否正確

### 影片無法播放
- 檢查 YouTube 網址是否正確
- 檢查影片是否設為「不公開」（unlisted）
