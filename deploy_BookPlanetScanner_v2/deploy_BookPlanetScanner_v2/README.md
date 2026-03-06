<div align="center">

# 布可星球條碼掃描器

[![Demo (GitHub Pages)](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f)](https://colinjen88.github.io/BookPlanetScanner/)  
[👉 線上可用版本（seobi.tw）](https://seobi.tw/books_query/scan.html)

</div>

# 布可星球快速登入 (Book Planet Quick Login)

> 🚀 專為「布可星球」設計的極速登入工具，支援一鍵登入！

## 主要功能

- **一鍵啟動**：點擊圖示即自動複製代碼並跳轉登入頁。
- **PWA 支援**：可安裝至手機或電腦桌面，像 App 一樣使用。
- **全自動登入**：配合 Userscript，實現真正的「零操作」登入。
- **安全隱私**：所有設定僅儲存於您的裝置，不傳送至伺服器。

## 快速開始

1. 開啟 [快速登入頁面](https://your-domain.com/quick-login.html)
2. 設定年級、班級、座號。
3. 點擊「啟動登入」即可！

## 安裝指南

詳見 [安裝說明頁面](https://your-domain.com/install.html) 或 `install.html`。

### 支援平台
- **Mobile**: iOS (Safari), Android (Chrome/Firefox)
- **Desktop**: Chrome, Edge, Safari

## 專案結構
- `quick-login.html`: PWA 主程式
- `install.html`: 安裝教學
- `userscript/`: 自動化腳本
- `userscript/bookplanet-autofill.user.js`: Tampermonkey 腳本
- `sw.js`: Service Worker (PWA 核心)

## 功能重點
- 雙引擎：原生 BarcodeDetector + ZXing（相互補強）
- 影像前處理：ROI、對比/亮度/降噪/銳化
- 操作體驗：防連點、防重入、掃描暫停、成功 Popover
- 數據本地：書單、統計皆在前端完成
- 雲端留言板：整合 Google Sheets API，支援即時留言與回覆同步

## 主要檔案
- `scan.html` 主頁（全部功能在此）
- `config/scan_config.json` 掃描/畫面/效能參數
- `data/books_list.json` 完整書單（預設載入）
- `data/messages.json` 留言（預設為空）
- `src/css/scan.css` 樣式；`src/js/*` 模組化工具

## 隱私與權限
- 條碼影像處理僅在瀏覽器端進行，不上傳伺服器
- 僅在使用時向瀏覽器請求攝影機權限

## 安全與隱私
- 已在 `scan.html` 中設定嚴格的 CSP（Content Security Policy），僅允許必要來源的 script/img/connect/frame。
- 依賴的第三方資源與資料收集（若保留 Google Tag Manager）等細節，請參見 [SECURITY.md](./SECURITY.md)。
- 建議將外部 CDN 依賴鎖定為明確版本並加入 SRI，或改為自我託管以降低供應鏈風險。

## 有任何問題或建議，歡迎聯繫姍姍爸爸
Email：[colinjen88@gmail.com](mailto:colinjen88@gmail.com)
