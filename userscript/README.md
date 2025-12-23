# 布可星球快速登入助手

> 🚀 一鍵登入布可星球答題系統！

## 這是什麼？

這是一個瀏覽器腳本，可以讓您的孩子**一鍵完成登入**布可星球答題系統，不用再手動選擇「學生登入」、輸入年級班級座號。

---

## ⚡ 安裝教學 (5 分鐘)

### 步驟 1：安裝 Tampermonkey

Tampermonkey 是一個瀏覽器擴充功能，可以運行使用者腳本。

| 瀏覽器 | 安裝連結 |
|--------|----------|
| Chrome | [安裝 Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) |
| Firefox | [安裝 Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) |
| Edge | [安裝 Tampermonkey](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) |

點擊連結 → 點「加到 Chrome」(或對應按鈕) → 完成！

### 步驟 2：安裝「布可快速登入助手」腳本

👉 **[點此安裝腳本](https://greasyfork.org/zh-TW/scripts/布可星球快速登入助手)** *(發佈後會有實際連結)*

或者手動安裝：
1. 點擊 Tampermonkey 圖示 → 「建立新腳本」
2. 刪除預設內容
3. 貼上 `bookplanet-autofill.user.js` 的內容
4. 按 `Ctrl+S` 儲存

### 步驟 3：使用「布可快速登入」網頁

1. 開啟 **[布可快速登入](https://your-domain.com/quick-login.html)** *(需替換為實際網址)*
2. 第一次使用：輸入孩子的年級、班級、座號 → 點「儲存設定」
3. 之後每次：直接點「🚀 啟動登入」→ **自動完成登入！**

---

## 📱 手機使用

### iOS (iPhone/iPad)
iOS 不支援 Tampermonkey，但您可以：
1. 使用「布可快速登入」產生代碼
2. 代碼會自動複製
3. 在登入頁選「學生登入」→ 貼上

### Android
1. 安裝 Firefox 瀏覽器
2. 安裝 Tampermonkey 擴充功能
3. 安裝此腳本
4. 使用方式同電腦

---

## ❓ 常見問題

### Q: 這樣安全嗎？
A: 完全安全！腳本只在臺南市 OpenID 登入頁面運作，不會收集任何資料，程式碼完全公開透明。

### Q: 學校換了怎麼辦？
A: 目前腳本使用頁面預設的學校設定。如需指定學校，請聯絡開發者新增功能。

### Q: 不能用了怎麼辦？
A: 如果臺南市教育局更新了登入頁面，腳本可能需要更新。請回報問題：
- [GitHub Issues](https://github.com/colinjen/BookPlanetScanner/issues)
- Email: colinjen88@gmail.com

---

## 🛠️ 技術資訊

- **腳本版本**: 1.0.0
- **相容網站**: `https://openid.tn.edu.tw/op/login.aspx*`
- **授權**: MIT License
- **原始碼**: [GitHub](https://github.com/colinjen/BookPlanetScanner)

---

## 📝 更新日誌

### v1.0.0 (2024-12-23)
- 首次發佈
- 自動選擇學生登入模式
- 自動填入年級班級座號代碼
- 自動送出表單
