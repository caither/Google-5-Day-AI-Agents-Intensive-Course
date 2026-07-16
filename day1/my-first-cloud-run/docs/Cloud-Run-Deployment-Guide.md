# 部署專案至 Google Cloud Run 逐步指南 (Step-by-Step Guide)

本指南將指導您如何使用 **Google Cloud CLI (gcloud)**，將目前的「智慧物流控制中心 (Smart Logistics Dispatch Center)」靜態網頁專案打包並部署至 **Google Cloud Run**。

---

## 1. 準備工作 (Prerequisites)

在開始部署之前，請確保您已完成以下準備：

1. **擁有 Google 帳戶與專案**：
   - 如果尚未建立，請至 [Google Cloud Console](https://console.cloud.google.com/) 建立一個專案，並記錄您的 **專案 ID (Project ID)**。
2. **安裝 Google Cloud CLI (gcloud)**：
   - 請參考 [官方安裝指南](https://cloud.google.com/sdk/docs/install) 下載並安裝適用於您作業系統的 `gcloud` 工具。
3. **完成 gcloud 初始化**：
   - 開啟終端機 (PowerShell 或 Command Prompt)，執行以下指令進行登入與初始化：
     ```bash
     gcloud init
     ```
   - 或直接進行登入與專案設定：
     ```bash
     gcloud auth login
     gcloud config set project <您的專案ID>
     ```
4. **啟用必要的 Google Cloud API**：
   - 部署至 Cloud Run 需要啟用 Cloud Run、Cloud Build 以及 Artifact Registry API：
     ```bash
     gcloud services enable run.googleapis.com \
                            cloudbuild.googleapis.com \
                            artifactregistry.googleapis.com
     ```

---

## 2. 步驟一：建立 Dockerfile (Create Dockerfile)

由於 Cloud Run 是基於容器 (Container) 的託管服務，因此需要將靜態網頁與網頁伺服器（例如 Nginx）打包成容器映像檔。

專案根目錄中已建立一個名為 `Dockerfile` 的檔案，其內容如下：

```dockerfile
FROM nginx:alpine

# 將本機的靜態網頁檔案複製到 Nginx 預設的主機網頁目錄
COPY . /usr/share/nginx/html

# 修改 Nginx 設定檔，將預設的監聽埠口由 80 改為 8080
RUN sed -i 's/listen\(.*\)80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# 宣告容器內部監聽的埠口為 8080
EXPOSE 8080
```

> [!IMPORTANT]
> **為什麼要將監聽埠口改為 8080？**
> Google Cloud Run 預設會將外部流量轉發至容器的 `8080` 埠口。雖然您可以在部署時額外指定其他埠口，但直接將 Nginx 修改為監聽 `8080` 是最符合 Cloud Run 預設標準、也是最簡潔的做法。

---

## 3. 步驟二：本機測試與驗證 (Local Verification)

在將專案部署到雲端之前，強烈建議您在本地端使用 Docker 進行建置與執行測試，以確保容器打包正常。

1. **建置 Docker 映像檔**：
   在專案根目錄執行以下指令：
   ```bash
   docker build -t logistics-app .
   ```

2. **在本機啟動容器**：
   執行以下指令將容器運行在背景，並將本機的 `8080` 埠口對應至容器的 `8080` 埠口：
   ```bash
   docker run -d -p 8080:8080 --name logistics-test logistics-app
   # 或者不取名字，自動命名
   docker run -d -p 8080:8080 --rm logistics-app
   ```

3. **網頁驗證**：
   - 打開瀏覽器並造訪 `http://localhost:8080`。
   - 確認「Smart Logistics Dispatch Center」儀表板能正常顯示、地圖能順利載入，且點擊 **Dispatch Orders** 時動畫功能正常。

4. **清理本地容器**（測試完成後）：
   ```bash
   docker stop logistics-test
   docker rm logistics-test
   ```

---

## 4. 步驟三：部署至 Cloud Run (Deploy to Cloud Run)

確認本機執行無誤後，即可使用 `gcloud` CLI 將程式碼上傳並在雲端進行自動建置與部署。

1. **執行部署指令**：
   在專案根目錄下，執行以下指令：
   ```bash
   gcloud run deploy logistics-app --source .
   ```

2. **部署過程中的互動式提示設定**：
   執行指令後，CLI 會出現以下提示，請依照指引選擇：
   
   - **Source code location** (原始碼位置)：預設為目前目錄 `.`，直接按下 `Enter` 鍵。
   - **Region** (部署區域)：建議選擇 `asia-east1` (台灣彰化) 或鄰近您的區域（輸入對應的號碼或區域名稱）。
   - **Allow unauthenticated invocations** (是否允許未驗證存取)：若要公開讓所有人存取您的網頁，請輸入 `y`。

3. **等待部署完成**：
   Cloud Run 會自動透過 Cloud Build 將原始碼包裝成 Container 映像檔，儲存至 Artifact Registry，並在 Cloud Run 上啟動服務。此過程約需 1~3 分鐘。

---

## 5. 步驟四：驗證雲端部署 (Cloud Verification)

當部署成功後，終端機會顯示類似以下的成功訊息與 **Service URL**：

```text
Service [logistics-app] revision [logistics-app-00001-xxx] has been deployed and is serving 100% of traffic.
Service URL: https://logistics-app-xxxxxx-de.a.run.app
```

- **複製 Service URL** 並在瀏覽器中開啟。
- 驗證您的應用程式是否在網路上正常運作！

---

## 6. 步驟五：清理資源 (Clean Up)

為了避免產生不必要的 Google Cloud 帳單費用，若您不再需要此測試服務，可以隨時將其下線刪除：

```bash
gcloud run services delete logistics-app
```
系統會提示您確認刪除，輸入 `y` 即可。
