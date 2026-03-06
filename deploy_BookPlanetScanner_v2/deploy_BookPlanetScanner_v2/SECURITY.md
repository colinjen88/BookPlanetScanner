# 安全與隱私政策

本檔案說明此專案的第三方依賴、版本鎖定策略、內容安全政策（CSP），以及資料收集與隱私說明。

## 第三方依賴
- ZXing（browser/library）
  - 來源：`https://unpkg.com/@zxing/library`、`https://unpkg.com/@zxing/browser`
  - 用途：條碼偵測引擎（搭配原生 BarcodeDetector）
- Iconify
  - 來源：`https://code.iconify.design/3/3.1.1/iconify.min.js`
  - 用途：圖示資源
- Google Tag Manager（若保留）
  - 來源：`https://www.googletagmanager.com/`
  - 用途：網站分析/標籤管理

建議：將 CDN 的 `@latest` 改為明確版本並加入 SRI（Subresource Integrity），或改為自我託管，以降低供應鏈風險。

## 內容安全政策（CSP）
在 `scan.html` <head> 內已加入 CSP meta，限制來源至必要網域：

- default-src 'self'
- script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://unpkg.com https://code.iconify.design 'wasm-unsafe-eval'
- connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net https://code.iconify.design https://unpkg.com
- img-src 'self' data: blob: https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net https://code.iconify.design
- frame-src 'self' https://www.googletagmanager.com
- style-src 'self' 'unsafe-inline'
- object-src 'none'
- base-uri 'self'
- form-action 'self'
- worker-src 'self' blob:
- media-src 'self' blob: data:
- frame-ancestors 'self'
- upgrade-insecure-requests

注意：若移除 GTM，請同步從 CSP 中移除對 `googletagmanager.com` 及 GA 相關來源的放行。

## 資料收集與隱私
- 影像處理與條碼辨識皆在瀏覽器端進行，不上傳伺服器。
- 書單與統計資料以前端檔案或 localStorage 形式存取。
- 若保留 Google Tag Manager：
  - 可能蒐集瀏覽行為等匿名分析資料；實際收集內容取決於 GTM 容器設定與載入的標籤。
  - 請定期審核 GTM 容器，避免載入不必要或高風險第三方標籤。

## 版本鎖定策略
- 建議固定外部依賴版本（避免使用 `@latest`），並加入 SRI。
- 對於必要外部腳本可考慮改為自我託管，配合 CSP 僅允許 'self' 來源，進一步降低供應鏈風險。

## 報告安全問題
若發現安全性問題，請於本 repo 提 Issue 或寄信至維護者信箱：
- Email: colinjen88@gmail.com
