# 科技新報頭條閱讀器 (TechNews CLI Tool)

[English Version](README.en.md) | 中文版本

這是一個基於 Node.js 開發的命令列介面 (CLI) 工具，能自動抓取 [科技新報 (TechNews.tw)](https://technews.tw/) 的最新頭條新聞，並讓使用者在終端機中選擇編號，直接在預設瀏覽器中開啟該文章進行閱讀。

---

## 核心功能

- **即時新聞抓取**：透過網頁爬蟲技術，即時取得科技新報首頁的最新頭條。
- **終端機色彩化呈現**：使用 `picocolors` 提升終端機輸出的可讀性與美觀度。
- **防重複網址過濾**：自動使用 `Set` 過濾重複的 URL，確保新聞清單不重複。
- **互動式命令列選單**：使用 Node.js 內建 `readline` 模組，讓使用者能夠鍵入編號或指令進行操作。
- **一鍵瀏覽器開啟**：整合 `open` 套件，在輸入文章編號後自動開啟系統預設瀏覽器。

---

## 系統需求

- **Node.js**：v18.0.0 或以上版本（推薦使用 v20+ 或 v24+，因專案內建使用 Node 原生 `fetch` API）。

---

## 安裝與執行

### 1. 安裝依賴套件

在專案根目錄下執行以下指令安裝所需套件：

```bash
npm install
```

### 2. 執行程式

安裝完成後，可透過 npm 腳本啟動工具：

```bash
npm start
```

或直接執行：

```bash
node index.js
```

---

## 專案結構

本專案結構非常簡潔，並將「開發上下文與決策歷史」視為第一等公民（First-class assets）：

```text
my-first-project/
├── index.js              # 核心程式邏輯（爬蟲與 CLI 互動）
├── package.json          # 專案資訊與套件依賴配置
├── package-lock.json     # 套件鎖定檔
├── AGENTS.md             # 本地 AI Agent 行為與工程規範
└── notes/                # 工程筆記目錄 (Engineering Notebook)
    └── daily/            # 每日開發日誌（包含決策、嘗試、坑點等）
        └── YYYY-MM-DD.md
```

### 開發工程筆記 (Engineering Notebook) 規範
本專案遵循嚴格的筆記紀錄規範，所有的開發思維、架構考量、調試過程以及技術權衡，都會記錄於 `notes/daily/` 下，並採用統一的 YAML Frontmatter 格式（如標題、日期、標籤、狀態等），確保專案知識的永續性與可搜尋性。

---

## 技術實作細節

本專案的核心技術可分為「Cheerio 網頁爬蟲」與「Readline 命令列互動」兩大模組。

### 1. Cheerio 網頁爬蟲邏輯

在 [index.js](index.js) 中，網頁爬取與解析流程如下：

* **發送請求**：使用 Node.js 原生的 `fetch` API 請求科技新報首頁。為了防止被網站阻擋，我們在 Headers 中加入了偽裝的 `User-Agent`。
* **HTML 解析**：取得 HTML 文字後，藉由 `cheerio.load(html)` 將其載入。Cheerio 提供了類似 jQuery 的語法，讓我們能方便地操作 DOM。
* **選擇器定位**：
  ```javascript
  $('h1.entry-title a').each((i, el) => { ... })
  ```
  我們使用 `h1.entry-title a` 選擇器來定位所有頭條文章的標題與連結。
* **防重機制**：宣告一個 `Set` 集合 `seenUrls`，在走訪每個 `<a>` 標籤時，將 URL 存入。若遇到重複的連結則跳過，確保輸出的新聞列表乾淨無重複。

### 2. Readline 命令列互動與瀏覽器開啟機制

程式抓取新聞後，會進入互動式選單：

* **建立介面**：使用內建 `readline.createInterface` 綁定標準輸入（`process.stdin`）與標準輸出（`process.stdout`）。
* **遞迴詢問機制**：
  我們設計了 `promptUser()` 函式。當使用者輸入非 `q` 的無效指令或成功開啟網頁後，程式會**遞迴呼叫** `promptUser()`，讓使用者能持續在同一個會話中輸入，不需要重新啟動程式。
* **瀏覽器調用**：
  當輸入有效編號後，會取得對應文章的 URL，並透過 `open` 套件非同步開啟：
  ```javascript
  await open(selected.url);
  ```
  若開啟瀏覽器失敗，程式會捕捉錯誤（`try-catch`）並提供 Fallback 機制——在終端機輸出該文章網址讓使用者手動點擊複製，確保體驗不中斷。
* **結束程式**：若輸入 `q`、`quit` 或 `exit`，將關閉 readline 介面並透過 `process.exit(0)` 安全退出。
