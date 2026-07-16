# Smart Logistics Dispatch Center (智慧物流控制中心)

一個輕量化、基於網頁的自動物流配送模擬儀表板。本專案透過 Leaflet.js 互動式地圖，展示配送車從倉庫出發、沿著規劃路線完成隨機訂單配送，並最終返回倉庫的流暢動畫與即時狀態面板。

---

## 🚀 核心功能特點 (Key Features)

- **互動式地圖**：採用 Leaflet.js 搭配 ESRI 衛星圖磚，清晰標示出倉庫及配送點位置。
- **一鍵派遣訂單 (Dispatch Orders)**：點擊後自動隨機在倉庫周邊 (~1.5km) 產生 20 個配送點。
- **智慧路線規劃**：基於距離最近鄰演算法規劃配送路徑，避免雜亂無章的折返。
- **平滑配送動畫**：配送車朝移動方向旋轉並平滑前進，路線隨配送進度逐步繪製延伸。
- **即時狀態儀表板**：配送車狀態（IDLE/DISPATCHING/RETURNING 等）、訂單完成數、配送進度條與完成提示。

---

## 📁 專案目錄結構 (Project Layout)

```text
├── index.html         # 前端儀表板 HTML 主結構
├── style.css          # 儀表板視覺樣式 (深藍色科技感風格)
├── app.js             # 模擬配送邏輯與 Leaflet 地圖動畫腳本
├── Dockerfile         # Nginx 容器配置檔 (預設監聽 8080 埠口)
└── docs/              # 專案相關文件目錄
    ├── Cloud-Run-Deployment-Guide.md                   # 部署至 GCP Cloud Run 的逐步指南
    └── ref/
        └── Deploy from AI Studio to Cloud Run (zh-tw).md  # 從 AI Studio 發佈的原始 Codelab 參考文獻
```

---

## 📖 相關文件與部署指引 (Guides & Documentation)

詳細的部署說明請參閱專案目錄中的相關文件：

1. **部署至 Google Cloud Run 逐步指南**：
   - 參閱 [docs/Cloud-Run-Deployment-Guide.md](file:///g:/01DevG/Google-5-Day-AI-Agents-Intensive-Course/day1/my-first-cloud-run/docs/Cloud-Run-Deployment-Guide.md)
   - 本指南詳細說明了如何準備本機 `gcloud` CLI 環境、在本機使用 Docker 驗證測試，以及最終一鍵部署至 Google Cloud Run 的指令。
2. **AI Studio 部署參考文件 (Codelab)**：
   - 參閱 [docs/ref/Deploy from AI Studio to Cloud Run (zh-tw).md](file:///g:/01DevG/Google-5-Day-AI-Agents-Intensive-Course/day1/my-first-cloud-run/docs/ref/Deploy from AI Studio to Cloud Run (zh-tw).md)
   - Google 官方提供的 Codelab 說明，介紹如何在 AI Studio 網頁介面上直接進行一鍵 Publish 與部署。
