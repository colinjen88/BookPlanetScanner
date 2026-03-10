<div align="center">

# 布可星球選書條碼掃描器 (Book Planet Scanner)

[![Current Version](https://img.shields.io/badge/version-v2.0.2-blue.svg)](./docs/project/VERSION.md)
[![Status Active](https://img.shields.io/badge/status-active-success.svg)](#)
[![Performance Optimized](https://img.shields.io/badge/performance-LUT_Optimized-ff69b4.svg)](#)

[👉 線上正式版本（seobi.tw）](https://book.seobi.tw/)

專為「布可星球」設計的高效能即時條碼掃描系統及資料自動化維護專案。
</div>

---

## 🚀 系統亮點 (System Highlights)

- **高效能單頁應用 (SPA)**：核心邏輯完全整合於單個 `index.html` 內，不依賴龐大的 JavaScript 模組系統，搭配瀏覽器快取機制將載入速度推向極致。
- ** LUT 效能優化 🚀**：內建 Look-Up Table 演算法進行即時影像顏色轉換與 Gamma 校正 (對比 / 亮度提升)，大幅降低 CPU 負載與耗電，低階手機也能保持流暢幀率。
- **雙掃描引擎切換**：優先使用瀏覽器原生 `BarcodeDetector API`，支援度不足的設備自動切換至 `ZXing Browser`。
- **客製化 UI / UX**：為中文介面特別調校的響應式設計，包含 RWD「開燈」自動對齊、長書名字體自動換行、成功偵測彈窗 (Popover) 與自動捲動定位動畫。
- **即時 JSON 設定配置機制**：透過 `config/scan_config.json` 動態配置 ROI 區域占比、影像處理解析度、按鈕延遲、動畫時長，不需重新發布主程式即可抽換細部參數。
- **自動化後端維護 (Python)**：配有完整的 `scripts/` (斷點續傳機制與記憶體優化版本爬蟲)，自動從布可星球官網更新龐大的書單，並推播更新至 Google Sheets。

---

## 📁 最新專案目錄架構 (Project Structure)

本專案經過深度模組化與資料清理，最新的版本架構如下：

```text
📦 BookPlanetScanner (專案根目錄)
├── index.html              # 🎯 主程式：單一頁面 Web 應用，包含所有掃描與介面互動邏輯
├── quick-login.html        # 🚀 布可快速登入：年級/班級/座號 → 一鍵開啟官網並自動帶入（搭配 userscript）
├── scan.html               # 🔄 向後相容轉址頁，自動 301 導向 https://book.seobi.tw/
├── README.md               # 📖 專案說明與架構 (本檔案)
├── SECURITY.md             # 🔒 資安政策說明 (CSP、依賴限制)
├── package.json            # 📦 專案 Meta 資訊
│
├── config/                 # ⚙️ 外部設定參數
│   └── scan_config.json    # 🔧 影像處理參數 (對比度/亮度/Gamma)、控制 ROI 動畫設定
│
├── data/                   # 📊 靜態資料庫
│   ├── books_list.json     # 📚 核心書單資料庫 (爬蟲更新產出，預設載入)
│   ├── messages.json       # 💬 預設留言資料結構
│   └── stats.json          # 📈 預設統計數據
│
├── src/                    # 🎨 靜態資源與前端樣式
│   ├── css/scan.css        # 💫 統一樣式表 (包含動態 RWD 與所有按鈕切換動畫)
│   └── Pinlocation.lottie  # ✨ Lottie 定位動畫資源
│
├── scripts/                # 🤖 後端維護與自動化 Python 指令碼
│   ├── isbn_continue.py    # 🕷️ 書單爬蟲主程式 (推薦使用：支援斷點續傳機制)
│   ├── isbn_memory_*.py    # 🕷️ 記憶體優化版爬蟲介面
│   ├── memory_cleaner.py   # 🧹 記憶體清理工具
│   └── myapikey...json     # 🔑 Google Sheets API 金鑰範本
│
├── tools/                  # 🛠️ 開發與維護輔助工具 (Bash / PowerShell)
│   ├── optimize.ps1(sh)    # 🚀 專案自動化程式碼瘦身與最佳化部署腳本
│   ├── cleanup.ps1         # 🧹 刪除過期備份檔、日誌的清理腳本
│   └── validate.ps1        # ✅ 動態驗證 JSON 檔案格式與完整性腳本
│
├── docs/                   # 📝 專案深度說明文檔
│   ├── project/            # 📦 專案狀態記錄
│   │   ├── CHANGELOG.md    # 📝 詳細變更日誌
│   │   ├── VERSION.md      # 🔖 目前版本與重大更新亮點
│   │   └── PROJECT_COMPLETION_REPORT.md  # 🏁 開發總結與里程碑報告
│   └── dev/                # 💻 開發指南
│       ├── API_REFERENCE.md      # 🔌 本地介面功能規格書
│       └── DEPLOYMENT_GUIDE.md   # 🌍 跨平台部署說明、Cloudflare 整合方式
│
├── archive/                # 🗃️ 舊版開發元件與功能備份封存
└── userscript/             # 🐒 布可快速登入助手（Tampermonkey 腳本，搭配 quick-login.html）
```

---

## 🚀 布可快速登入 (Quick Login)

專案提供**布可快速登入**流程，搭配臺南市教育局 OpenID，讓學生一鍵完成登入：

1. 開啟 [布可快速登入](https://book.seobi.tw/quick-login.html)（或本機 `quick-login.html`）
2. 輸入年級、班級、座號 → 儲存設定（僅首次）
3. 點「啟動登入」→ 另開官網登入頁，腳本會自動帶入代碼並送出

**電腦**：需安裝 [Tampermonkey](https://www.tampermonkey.net/) 與專案內 [布可快速登入助手](userscript/bookplanet-autofill.user.js) 腳本。  
**手機**：可使用「複製」按鈕複製 5 碼代碼，到官網手動貼上。  
詳細說明見 [userscript/README.md](userscript/README.md)。

---

## 🛠️ 開發與建置部署 (Development & Deployment)

專案的前端介面為純靜態架構 (`Vanilla JS` + `HTML5` + `CSS3`)，**無須複雜建置流程**。

### 步驟 1: 發布前端更新
無論修改修改 `index.html` 或 `src/css/scan.css`，都可以隨存隨看（亦相容 VS Code Live Server）。

### 步驟 2: 最佳化打包
如果準備更新部署版本，可以直接執行內建的優化工具，快速將程式碼打包為 zip 檔：
- **Windows**: `pwsh tools\optimize.ps1`
- **Linux/Mac**: `bash tools/optimize.sh`

### 步驟 3: GitHub 部署 / Vercel / Cloudflare
直接推送 `main` 分支或是透過 Cloudflare Pages 連接 Git Repository 自動抓取目錄下內容。部署完成即可藉由 [book.seobi.tw](https://book.seobi.tw/) 開放使用者存取。

> **部署細節與架構說明**
> 詳細設定可以參考 [部署指南文件 (DEPLOYMENT_GUIDE.md)](docs/dev/DEPLOYMENT_GUIDE.md)。

---

## 🕷️ Python 爬蟲與自動化更新

為隨時確保選書為最新清單，專案配備有自動向布可星球查詢並同步到 Google Sheets 的腳本。

1. **安裝環境與相依**:
   若要執行 `scripts/` 底下的工具，請確保您有 `Python 3.9+`，建議使用虛擬環境建立 `.venv`：
   ```bash
   pip install selenium webdriver-manager gspread oauth2client beautifulsoup4
   ```
2. **斷點續爬 (推薦方式)**:
   ```bash
   python scripts/isbn_continue.py
   ```
   會自動分批爬取書籍，記錄在進度檔案中。重啟爬蟲不會重新抓取已完成的部分，大幅省下時間並可抵抗網路中斷。
3. **爬蟲日誌**:
   產出的最新資料請存放於 `data/books_list.json` 中並進行 Commit。確保使用者頁面重整後能載入最新的書單。

---

## 🛟 相關資源與技術支援

- **版本變遷**：詳見 [CHANGELOG.md](docs/project/CHANGELOG.md) 以及 [VERSION.md](docs/project/VERSION.md)。
- **聯絡維護單位**：任何問題或系統維護，請隨時聯繫 _**colinjen88**_ Github Issue 版面 或洽 Email。

---
<div align="center">
  <sub>最後更新：2026/03 | 版本：v2.0.2 - "Quick Login & Docs"</sub><br>
  <sub>Designed for 📚 Book Planet</sub>
</div>
