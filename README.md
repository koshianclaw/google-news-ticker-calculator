# Google News Ticker Calculator

一個小型雲端可部署 Web App，整合了：

- **Google News 最新新聞列表**
- **跑馬燈 headline ticker**
- **內建計算機**

這份專案目前同時提供兩種部署方式：

1. **Node / Express 版本**：適合本機或 Render / Railway 之類的傳統 Web Service
2. **GitHub Pages + Serverless 版本**：前端放 GitHub Pages，新聞 API 放在 Vercel Serverless Function

---

## 專案結構

```text
google-news-ticker-calculator/
├── api/
│   └── news.js              # Vercel serverless API
├── docs/
│   ├── app.js               # GitHub Pages 用前端 JS
│   ├── index.html           # GitHub Pages 入口
│   └── styles.css           # GitHub Pages 樣式
├── public/
│   ├── app.js               # Express 版前端 JS
│   ├── index.html           # Express 版前端
│   └── styles.css           # Express 版樣式
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js                # Express 代理伺服器
└── vercel.json              # Vercel 設定
```

---

## 為什麼不能只用 GitHub Pages？

因為瀏覽器直接抓 Google News 幾乎會遇到 **CORS 限制**。

所以實際可行做法是：

- **GitHub Pages**：只放靜態前端
- **Vercel API**：代替瀏覽器去抓 Google News RSS，再回傳 JSON

這就是這份專案現在提供的 **B 方案**。

---

## 方案 B：GitHub Pages + Vercel Serverless

### Step 1：把 repo 放上 GitHub

建立 repo 後推上去，例如：

```bash
cd /Users/koshianclaw/Desktop/google-news-ticker-calculator
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

### Step 2：部署 Serverless API 到 Vercel

Vercel 直接匯入這個 GitHub repo 即可。

Vercel 會自動辨識：

- `api/news.js` → `/api/news`

部署完成後你會拿到像這樣的網址：

```text
https://your-project-name.vercel.app
```

可先測：

```text
https://your-project-name.vercel.app/api/news
```

如果有回傳 JSON，就代表 API 正常。

### Step 3：設定 GitHub Pages 前端要打哪個 API

打開：

- `docs/index.html`

找到這段：

```html
<script>
  window.APP_CONFIG = {
    apiBaseUrl: 'https://YOUR-VERCEL-PROJECT.vercel.app'
  };
</script>
```

改成你的 Vercel 網址，例如：

```html
<script>
  window.APP_CONFIG = {
    apiBaseUrl: 'https://your-project-name.vercel.app'
  };
</script>
```

然後 commit + push。

### Step 4：開 GitHub Pages

在 GitHub repo 設定裡：

- Settings
- Pages
- Build and deployment
- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**

完成後 GitHub Pages 會提供網址，例如：

```text
https://<your-username>.github.io/google-news-ticker-calculator/
```

這樣前端就會從 GitHub Pages 載入，並呼叫你的 Vercel `/api/news`。

---

## 本機 Express 版本

如果你要本機跑：

```bash
cd /Users/koshianclaw/Desktop/google-news-ticker-calculator
npm install
npm start
```

打開：

```text
http://localhost:3000
```

---

## 可調整的 Google News RSS

預設 RSS：

```text
https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant
```

如果你想改成其他地區，可在部署平台設定環境變數，例如切回美國版：

```bash
GOOGLE_NEWS_RSS=https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en
```

Vercel / Render 都可以設這個環境變數。

---

## 注意事項

- Google News RSS 內容是否能順利抓到，會受地區或網路環境影響
- 前端每 5 秒刷新一次，但實際新聞來源未必每 5 秒都有新內容
- 計算機只接受基本數學字元：`+ - * / . ( )`
- 如果 GitHub Pages 顯示有畫面但沒新聞，通常是：
  - `docs/index.html` 的 `apiBaseUrl` 還沒改
  - 或 Vercel API 還沒部署成功

---

## 最推薦的部署方式

如果你要的是：

- 程式碼放 GitHub
- 網頁公開可打開
- 新聞功能正常

那目前最實際的是：

- **GitHub repo**：存原始碼
- **GitHub Pages**：前端頁面
- **Vercel**：serverless API

---

## 快速摘要

### GitHub Pages 前端
- 使用 `docs/`

### Vercel API
- 使用 `api/news.js`

### 本機 Node 版
- 使用 `server.js + public/`
