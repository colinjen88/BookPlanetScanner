<div align="center">

# 布可星球條碼掃描器

[![Demo (GitHub Pages)](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f)](https://colinjen88.github.io/BookPlanetScanner/)  
[👉 線上可用版本（seobi.tw）](https://seobi.tw/books_query/scan.html)

</div>

## 這是什麼
- 用相機即時掃描書本條碼（ISBN），比對本地書單，判斷是否為「布可星球選書」。
- 純前端實作（無後端），可直接部署到 GitHub Pages。

## 如何使用
- 開啟 Demo 連結，授權相機後點「開始掃描」。
- 掃到條碼會即時顯示比對結果；找到選書會出現成功提示。

## 功能重點
- 雙引擎：原生 BarcodeDetector + ZXing（相互補強）
- 影像前處理：ROI、對比/亮度/降噪/銳化
- 操作體驗：防連點、防重入、掃描暫停、成功 Popover
- 數據本地：書單、統計、留言皆在前端完成

## 主要檔案
- `scan.html` 主頁（全部功能在此）
- `config/scan_config.json` 掃描/畫面/效能參數
- `data/books_list.json` 完整書單（預設載入）
- `data/messages.json` 留言（預設為空）
- `src/css/scan.css` 樣式；`src/js/*` 模組化工具

## 隱私與權限
- 條碼影像處理僅在瀏覽器端進行，不上傳伺服器
- 僅在使用時向瀏覽器請求攝影機權限

## 有任何問題或建議，歡迎聯繫姍姍爸爸
Email：[
colinjen88@gmail.com](mailto:colinjen88@gmail.com)

一鍵發信（含主旨）：
[點我發信](mailto:colinjen88@gmail.com?subject=%E5%B8%83%E5%8F%AF%E6%98%9F%E7%90%83%E6%A2%9D%E7%A2%BC%E6%8E%83%E6%8F%8F%E5%99%A8%20%E4%BD%BF%E7%94%A8%E5%9B%9E%E9%A5%8B)