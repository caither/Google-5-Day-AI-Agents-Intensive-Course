---
title: "從 AI Studio 部署到 Cloud Run"
source: "https://codelabs.developers.google.com/deploy-from-aistudio-to-run?hl=en&authuser=0#3"
author:
published:
created: 2026-07-16
description: "在本 Codelab 中，您將在 AI Studio 中使用 vibe coding（直覺編碼）建立網頁應用程式，並將該應用程式部署到 Cloud Run。"
tags:
  - "clippings"
---

## 您將學到什麼 (What you'll learn)

在本 Codelab 中，您將學習如何：

1. 在 Google AI Studio 中使用 vibe coding 建立一個簡單的網頁應用程式。
2. 測試應用程式是否按預期運作。
3. 將應用程式部署到 Cloud Run。

## 2\. 開始之前 (Before you begin)

1. 如果您還沒有 Google 帳戶，則必須[建立 Google 帳戶](https://accounts.google.com/SignUp?authuser=0)。
	- 請使用個人帳戶而非工作或學校帳戶。工作和學校帳戶可能會有限制，阻礙您啟用此實驗室所需的 API。
2. 導覽至 [Google AI Studio](https://aistudio.google.com/app/apps?authuser=0)，並閱讀服務條款。
3. 請注意，如果您使用的是 [Google Cloud 入門方案層級 (Starter Tier)](https://ai.google.dev/gemini-api/docs/aistudio-deploying?authuser=0#about-the-starter-tier)，您可以在單一 Cloud Run 區域中部署最多 **兩個全端應用程式**，而無需設定完整的 Google Cloud 環境或帳單帳戶。

![歡迎來到 AI Studio](https://codelabs.developers.google.com/static/deploy-from-aistudio-to-run/img/ai-studio-terms_2880.png?authuser=0)

## 3\. 原型設計 (Prototype)

```
建立一個外觀專業、具有現代物流控制中心風格的單頁前端應用程式，使用 **Leaflet** 顯示互動式配送地圖。

頁面上方設置標題「Smart Logistics Dispatch Center」，並提供一個醒目的 **Dispatch Orders** 按鈕。地圖旁或地圖上方應顯示配送資訊面板，包含：

* 訂單總數
* 已完成配送數量
* 目前配送中的訂單編號
* 配送進度百分比與進度條
* 配送車目前狀態

初始畫面在地圖中央顯示一座倉庫，使用明顯的倉庫圖示或 Marker 標示，配送車停在倉庫位置。

當使用者按下 **Dispatch Orders** 按鈕時，執行以下動畫流程：

1. 在倉庫周圍的合理範圍內隨機產生 20 個訂單位置。
2. 每個訂單以編號 Marker 顯示，例如 `#01` 至 `#20`，初始狀態使用橘色或紅色，並帶有短暫的彈出或脈衝動畫。
3. 系統依照距離或簡單的最近鄰規則，自動決定配送順序，避免完全雜亂的移動路線。
4. 配送車從倉庫出發，沿著規劃路線平滑移動，車輛圖示需朝移動方向旋轉。
5. 配送路線不能一次全部顯示，而應隨著配送車前進逐步延伸，形成正在繪製路線的視覺效果。
6. 每當配送車抵達一個訂單位置：

   * 該訂單 Marker 由橘色或紅色轉為綠色。
   * Marker 顯示完成勾選圖示。
   * 產生短暫的成功脈衝或光圈動畫。
   * 資訊面板同步更新已完成數量、目前訂單及進度條。
7. 完成最後一筆訂單後，配送車返回倉庫，並顯示「All deliveries completed」的成功訊息。
8. 整個配送動畫應在約 5 秒內完成，節奏流暢且具有明顯的進度變化。

視覺設計要求：

* 採用正式、現代化的物流儀表板設計，不要使用卡通風格。
* 使用深藍色、白色及少量亮綠色作為主要配色。
* 地圖與資訊卡片應有圓角、陰影與清楚的資訊層級。
* 配送車、倉庫、待配送訂單及已完成訂單必須能一眼區分。
* 按下 Dispatch 後暫時停用按鈕，避免重複觸發。
* 配送完成後，按鈕改為 **Dispatch Again**，再次按下時清除舊路線與訂單並重新產生一組配送任務。
* 支援桌面與行動裝置，版面需具備響應式設計。
* 所有動畫應平滑，不可出現 Marker 瞬間跳動或路線一次全部出現的情況。

技術限制：

* 使用 HTML、CSS、JavaScript 與 Leaflet 實作。
* 不需要後端服務或真實導航 API。
* 可使用 OpenStreetMap 圖磚。
* 所有訂單、路線與配送進度均在前端模擬。
* 請提供可直接執行的完整程式碼，並確保載入頁面後即可操作。

```



## 4\. 部署到 Cloud Run (Deploy to Cloud Run)

現在應用程式已準備就緒，請將其部署 to Cloud Run：

1. 在頁面右上角，點擊 **Publish**（發布）。

![螢幕右上角的 Publish 按鈕](https://codelabs.developers.google.com/static/deploy-from-aistudio-to-run/img/publish-button_2880.png?authuser=0)

2. 這將開啟 **Deploy app on Google Cloud**（在 Google Cloud 上部署應用程式）對話框。

![在 Google Cloud 上部署應用程式精靈的起點](https://codelabs.developers.google.com/static/deploy-from-aistudio-to-run/img/deploy-start_2880.png?authuser=0)

3. 點擊 **Select a Cloud Project**（選擇 Cloud 專案）下拉式選單以選擇您的專案，或繼續使用 **Default Gemini Project**（預設 Gemini 專案）。
4. 從下拉式選單中選擇專案。如果找不到您的專案，點擊 **Import project**（匯入專案），然後在 **Import project** 面板中選擇專案。
5. 如果收到提示，請選擇 **Individual**（個人）作為您的組織類型，並輸入您的街道地址：

![帳單帳戶詳細資料](https://codelabs.developers.google.com/static/deploy-from-aistudio-to-run/img/enter-address_2880.png?authuser=0)

6. 點擊 **Publish your app**（發布您的應用程式），然後等待應用程式部署到 Cloud Run。請注意，AI Studio 會自動生成 Cloud Run 服務名稱。

![應用程式發布步驟](https://codelabs.developers.google.com/static/deploy-from-aistudio-to-run/img/publish-your-app_2880.png?authuser=0)

7. 部署需要幾分鐘的時間。完成後，點擊 **App URL** 以開啟已部署的網頁應用程式。

![應用程式發布步驟](https://codelabs.developers.google.com/static/deploy-from-aistudio-to-run/img/published_2880.png?authuser=0)

## 5\. 清理資源 (Clean up)

為了避免您的 Google Cloud 帳戶因本 Codelab 中使用的資源而產生費用，請點擊 **Unpublish app**（取消發布應用程式）：

![取消發布應用程式步驟](https://codelabs.developers.google.com/static/deploy-from-aistudio-to-run/img/unpublish_2880.png?authuser=0)
