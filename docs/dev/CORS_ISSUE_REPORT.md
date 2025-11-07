# 布可星球掃描器專案現況與待辦事項報告

**文件版本**: 1.0
**更新日期**: 2024年5月21日
**主要目標**: 記錄留言板功能 CORS 跨域錯誤的完整偵錯歷程，並提供解決問題的最終執行方案。

---

## 1. 專案總覽

本專案「布可星球條碼掃描器」是一個純前端的 Web 應用程式，主要功能是透過手機或電腦鏡頭掃描書籍條碼 (ISBN)，並與本地書單比對，即時判斷該書籍是否為「布可星球選書」。

- **前端應用**: `scan.html`
- **核心技術**: JavaScript、原生 BarcodeDetector API、ZXing.js 函式庫。
- **主要功能**:
    - 📷 即時相機掃描與影像處理。
    - 🧠 雙引擎條碼辨識。
    - 📖 本地書單即時比對。
    - 💬 留言回饋系統 (透過 Google Apps Script API)。

---

## 2. 目前進度與狀態

-   **已完成功能**:
    -   掃描器的核心功能（相機啟動、影像處理、條碼辨識）皆可正常運作。
    -   掃描參數、UI 設定等已抽離至 `config/scan_config.json`，方便管理。
    -   前端 `scan.html` 已正確編寫 `fetch` 請求，準備與後端 API 進行通訊。

-   **主要待解決問題**:
    -   **留言板功能完全無法使用**。前端 `fetch` 請求 Google Apps Script API 時，被瀏覽器的 CORS (跨來源資源共用) 政策阻擋，導致無法載入留言與送出新留言。

---

## 3. 主要問題詳述：留言板 CORS 跨域錯誤

### 3.1. 問題現象

瀏覽器開發者工具顯示以下錯誤，導致所有對 Google Apps Script API 的請求失敗：
```
Access to fetch at 'https://script.google.com/...' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```
以及針對 `POST` 請求的預檢 (preflight) 錯誤：
```
Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### 3.2. 已完成的偵錯歷程與已排除的原因

我們已經系統性地排除了以下所有可能的原因：

1.  **前端程式碼問題**:
    -   `scan.html` 中的 `fetch` 請求格式 (GET/POST) 正確。
    -   API 網址已從 `config/scan_config.json` 動態載入。
    -   內容安全政策 (CSP) 已正確設定，允許 `connect-src https://script.google.com`。

2.  **Google Apps Script 程式碼問題**:
    -   已檢查並修正後端 Apps Script 程式碼。
    -   `doGet`, `doPost`, `doOptions` 函式都已包含正確的 CORS 標頭 (`Access-Control-Allow-Origin: '*'`)。
    -   已修正 `doOptions` 中 `Access-Control-Allow-Headers` 的拼寫錯誤。

3.  **Google Apps Script 部署問題**:
    -   已確認每次部署時，「誰有權存取」皆設定為「**任何人**」。
    -   已確認每次重新部署後，都將**最新的網址**更新至前端的 `config/scan_config.json` 檔案中。
    -   已嘗試透過在程式碼中加入註解來「強制產生全新的部署」，以排除 Google 伺服器快取的可能性。

### 3.3. 最終判斷的根本原因

在排除了上述所有可能性後，我們確認問題的根源在於 **Google Cloud Platform (GCP) 的專案層級設定**。

您的 Apps Script 專案目前是與一個**「預設」(Default) 的 GCP 專案**綁定。這種預設專案是一個功能受限的隱藏專案，**不允許開發者修改其 OAuth 同意畫面或 API 權限**。這導致即使您在 Apps Script 部署介面選擇了「任何人」存取，GCP 層級的預設限制（應用程式處於「測試中」狀態）依然生效，使得所有匿名的公開請求（例如來自您網站的 `fetch`）都被拒絕，伺服器因此不會回傳 CORS 標頭。

---

## 4. 後續解決方案與執行流程

為了解決這個根本問題，我們需要手動為您的 Apps Script 專案**建立並綁定一個您可以完全控制的「標準」(Standard) GCP 專案**。

**請在工作繼續時，嚴格依照以下步驟操作：**

1.  **建立一個新的標準 GCP 專案**:
    1.  前往 Google Cloud 主控台。
    2.  點擊頁面頂端的專案選單，選擇「**新增專案**」。
    3.  為專案命名 (例如 `BookPlanetScanner-API`)，然後點擊「**建立**」。
    4.  建立後，進入該專案的「**IAM 與管理**」->「**設定**」，複製「**專案編號**」(Project number)。

2.  **將 Apps Script 專案連結到新的 GCP 專案**:
    1.  回到 Google Apps Script 編輯器，進入「**專案設定**」(左側齒輪圖示 ⚙️)。
    2.  點擊「**變更專案**」。
    3.  在「**GCP 專案編號**」輸入框中，貼上您剛剛複製的**專案編號**。
    4.  點擊「**設定專案**」並確認。

3.  **設定新專案的 OAuth 同意畫面 (最關鍵的一步)**:
    1.  回到 GCP 主控台，並確保您已選取剛剛建立的新專案。
    2.  前往「**API 和服務**」->「**OAuth 同意畫面**」。
    3.  選擇「**外部 (External)**」作為使用者類型，然後點擊「**建立**」。
    4.  填寫必要資訊（應用程式名稱、使用者支援電子郵件等），然後一路點擊「儲存並繼續」完成設定。
    5.  回到「OAuth 同意畫面」的主頁，找到「**發布狀態**」，點擊「**發布應用程式**」(Publish App)，並確認發布。
    6.  **最終確認「發布狀態」已變為「正式版」(In production)。**

4.  **最後的重新部署**:
    1.  完成上述所有 GCP 設定後，回到 **Google Apps Script** 編輯器。
    2.  點擊「**部署**」->「**新增部署作業**」。
    3.  再次確認「誰有權存取」是「**任何人**」。
    4.  點擊「**部署**」，並複製產生的**全新的網頁應用程式網址**。
    5.  將這個**全新的網址**貼到您專案的 `c:/new_git/BookPlanetScanner/config/scan_config.json` 檔案中，覆蓋掉舊的 `feedbackApiUrl`。