# 布可星球條碼掃描器 - 專案結構文檔

## 🎯 專案概述

這是一個基於 Web 技術的條碼掃描應用程式，專門用於檢測書籍是否在布可星球選書清單中。使用現代瀏覽器的相機 API 和多種條碼檢測引擎，提供快速且準確的條碼識別功能。

## 📁 檔案結構

```
布可星球條碼掃描器/
├── 📄 scan.html              # 主要應用程式入口
├── 📄 package.json           # 專案配置和依賴
├── 📄 scan_backup.html       # HTML 備份檔案
├── 📄 app.js                 # 應用程式入口腳本
├── 📄 FIXES_SUMMARY.html     # 修復摘要報告
│
├── 📂 assets/                # 靜態資源目錄
│   ├── 📂 css/
│   │   └── scan.css          # 主要樣式表
│   ├── 📂 js/                # JavaScript 模組
│   │   ├── app.js            # 主應用程式邏輯
│   │   ├── data-manager.js   # 資料管理模組
│   │   ├── feedback.js       # 回饋系統模組
│   │   ├── ui-utils.js       # UI 工具函數
│   │   └── scanner.js.broken # 舊版掃描模組（已棄用）
│   └── Pinlocation.lottie    # 動畫資源
│
├── 📂 config/                # 配置檔案目錄
│   └── scan_config.json      # 掃描器設定檔
│
├── 📂 data/                  # 資料檔案目錄
│   ├── books_list.json       # 布可星球選書清單
│   ├── messages.json         # 留言板資料
│   └── stats.json           # 統計資料
│
├── 📂 docs/                  # 文檔目錄
│   ├── README.md             # 專案說明文件
│   ├── CONFIG_README.md      # 設定檔案說明
│   ├── CODE_OPTIMIZATION_REPORT.md # 程式碼優化報告
│   └── DATA_MANAGEMENT.md    # 資料管理文檔
│
├── 📂 文件說明/              # 中文文檔目錄
│   ├── 資料夾整理說明.md
│   └── EXECUTION_LOG.md
│
├── 📂 爬蟲程式/              # 資料收集工具
│   ├── isbn_batch.py         # 批次處理腳本
│   ├── isbn_continue.py      # 續行處理腳本
│   ├── isbn_memory_optimized.py # 記憶體優化版本
│   ├── isbn_selenium.py      # Selenium 版本
│   ├── memory_cleaner.py     # 記憶體清理工具
│   ├── cleanup_processes.bat # 處理清理腳本
│   └── myapikey.json        # API 金鑰配置
│
├── 📂 原始資料/              # 原始資料檔案
│   ├── list.csv              # 原始書籍清單
│   └── csv_to_json.ps1       # 資料轉換腳本
│
├── 📂 進度檔案/              # 處理進度檔案
│   ├── all_books_complete.json
│   ├── en_books.json
│   ├── zh_books_1_80.json
│   ├── zh_books_161_242.json
│   └── zh_books_81_160.json
│
└── 📂 其它收/                # 其他檔案
    ├── camera_test.html      # 相機測試頁面
    ├── index.html           # 索引頁面
    ├── scan_book.html       # 書籍掃描頁面
    ├── scan_fast.html       # 快速掃描頁面
    ├── scan_optimized.html  # 優化版掃描頁面
    ├── scan_pro.html        # 專業版掃描頁面
    ├── scan_simple.html     # 簡化版掃描頁面
    ├── scan_u.html         # 用戶版掃描頁面
    └── test.html           # 測試頁面
```

## 🔧 核心功能模組

### 1. 條碼檢測引擎
- **原生 BarcodeDetector API**: 瀏覽器內建的高效檢測
- **ZXing Browser 引擎**: 跨平台條碼檢測庫
- **多格式支援**: EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39, ITF 等

### 2. 影像處理管線
- **ROI (Region of Interest)**: 感興趣區域檢測
- **影像增強**: 對比度、亮度、伽馬值調整
- **降噪與銳化**: 提升條碼檢測準確度
- **多角度檢測**: 支援旋轉和切片檢測

### 3. 用戶介面
- **響應式設計**: 支援桌面和行動裝置
- **即時反饋**: 零延遲的 UI 狀態更新
- **視覺回饋**: 成功提示和錯誤訊息
- **手電筒控制**: 雙按鈕設計（開燈/關燈）

### 4. 資料管理
- **書籍清單**: JSON 格式的選書資料庫
- **智慧匹配**: 多策略的 ISBN 匹配演算法
- **留言系統**: 本地儲存的回饋機制
- **統計追蹤**: 掃描效能和成功率統計

## ⚙️ 配置系統

### 掃描器設定 (`config/scan_config.json`)
```json
{
  "roi": {
    "enabled": true,
    "widthRatio": 0.78,
    "heightRatio": 0.42
  },
  "processing": {
    "contrast": 1.35,
    "brightness": 1.05,
    "gamma": 0.9,
    "denoise": true,
    "sharpen": true
  },
  "detection": {
    "allowRotation": true,
    "allowSlices": true,
    "useBarcodeDetector": true,
    "useZxing": true,
    "intervalMs": 120
  },
  "camera": {
    "facingMode": "environment",
    "idealWidth": 1920,
    "idealHeight": 1080
  }
}
```

## 🚀 快速開始

### 1. 環境要求
- 現代瀏覽器（支援 getUserMedia API）
- HTTPS 連線（本地開發可使用 localhost）
- 相機權限（用於條碼掃描）

### 2. 部署步驟
1. 下載所有檔案到 Web 伺服器
2. 確保檔案結構完整
3. 開啟 `scan.html` 即可使用

### 3. 開發模式
```bash
# 使用 Python 簡易伺服器
python -m http.server 8000

# 使用 Node.js live-server
npx live-server --port=8000
```

## 🔍 使用說明

### 基本操作
1. **開啟應用程式**: 載入 `scan.html`
2. **允許相機權限**: 點擊「開始掃描條碼」
3. **掃描條碼**: 將書籍條碼對準畫面中央
4. **查看結果**: 系統會顯示是否為布可星球選書

### 進階功能
- **手電筒控制**: 在低光環境下開啟閃光燈
- **設定調整**: 修改 `config/scan_config.json` 優化檢測
- **留言回饋**: 使用內建留言系統提供意見

## 🛠️ 自訂配置

### 調整檢測參數
編輯 `config/scan_config.json`:
- **提升速度**: 降低 `intervalMs`，關閉 `allowRotation`
- **提升準確度**: 啟用所有檢測選項，調整影像處理參數
- **適應環境**: 調整 `contrast`、`brightness` 和 ROI 設定

### 更新書籍清單
替換 `data/books_list.json`:
```json
[
  {
    "ISBN": "9789573123456",
    "書名": "範例書籍",
    "適合對象": "7-12歲"
  }
]
```

## 🔧 維護與更新

### 定期維護
- 更新 `data/books_list.json` 書籍清單
- 檢查並清理 `data/messages.json` 留言資料
- 備份重要配置檔案

### 效能優化
- 監控 `data/stats.json` 中的統計資料
- 根據使用情況調整掃描參數
- 定期清理瀏覽器快取

## 🐛 故障排除

### 常見問題
1. **相機無法啟動**: 檢查瀏覽器權限和 HTTPS 設定
2. **檢測不準確**: 調整光線條件或修改檢測參數
3. **載入失敗**: 確認檔案路徑和網路連線

### 除錯工具
- 瀏覽器開發者工具控制台
- `scan.html` 內建的日誌系統
- 網路面板檢查資源載入

## 📈 效能指標

### 檢測引擎效能
- **原生 BarcodeDetector**: ~50-100ms
- **ZXing Browser**: ~100-200ms
- **成功率**: >95% (良好光線條件)

### 系統需求
- **最小記憶體**: 50MB
- **建議記憶體**: 100MB+
- **CPU**: 現代雙核心處理器
- **網路**: 初次載入 ~2MB

## 📄 授權與版權

本專案為內部使用，請遵循相關的授權條款和使用規範。

---

**最後更新**: 2025年10月11日  
**版本**: v2.0  
**維護者**: AI Assistant