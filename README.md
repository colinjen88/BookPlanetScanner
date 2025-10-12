<div align="center">

# 布可星球條碼掃描器

即時掃描書本條碼（ISBN），比對本地書單，判斷是否為布可星球選書；全站純前端，支援行動裝置相機、雙引擎偵測與成熟的 UI/UX 細節。

[![Static](https://img.shields.io/badge/site-static-brightgreen)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

## 亮點

- 原生 BarcodeDetector + ZXing 雙引擎，準確穩定
- ROI 限定、降噪/銳化等影像前處理，低光也好掃
- 防連點、防重入、掃描暫停、成功 Popover 動畫
- 書單、統計、留言等資料皆在前端處理（隱私安心）
- 可切換精簡/完整版資料集（預設使用完整版）

## 快速開始

本地預覽（需允許相機權限）

```powershell
npm run serve
```

預設開啟 http://127.0.0.1:8000/scan.html（請允許相機權限）

切換資料集（選用）
- 在網址加上 `?mode=lite` 或用頁尾版本號「v1.1」雙擊 → 管理工具 → 切換資料集

## 主要檔案

- `scan.html` 主頁（全部功能在此）
- `config/scan_config.json` 掃描/畫面/效能參數
- `data/books_list.json` 完整書單（預設載入）
- `data/messages.json` 留言（預設為空）
- `src/css/scan.css` 樣式；`src/js/*` 模組化工具

## 部署到 GitHub Pages（靜態）

1. 將此專案推送到 GitHub
2. 啟用 Pages，或直接使用 .github/workflows/pages.yml 自動部署
3. 首頁為 `index.html`（自動導向 `scan.html`）

## 隱私與權限

- 條碼影像處理僅在瀏覽器端進行，不上傳伺服器
- 僅在使用時向瀏覽器請求攝影機權限

## 授權

MIT License

---

附註：如需縮小倉庫體積，可改用 `?mode=lite` 或在管理工具切換為精簡資料集（`data/books_list.sample.json`）。