# 布可星球條碼掃描器 - 部署與操作手冊

## 📋 目錄
1. [系統需求](#系統需求)
2. [部署指南](#部署指南)
3. [配置管理](#配置管理)
4. [操作說明](#操作說明)
5. [維護指南](#維護指南)
6. [故障排除](#故障排除)
7. [效能優化](#效能優化)

## 🖥️ 系統需求

### 伺服器端需求
- **Web 伺服器**: Apache, Nginx, IIS 或任何支援靜態檔案的伺服器
- **HTTPS 支援**: 必須（相機 API 需求）
- **磁碟空間**: 最少 50MB
- **記憶體**: 建議 512MB+

### 客戶端需求
- **瀏覽器版本**:
  - Chrome 88+ / Edge 88+
  - Firefox 85+
  - Safari 14.1+
  - iOS Safari 14.5+
  - Android Chrome 88+
- **相機**: 後置相機（條碼掃描用）
- **網路**: 穩定的網路連線（初次載入）

### 權限需求
- 相機存取權限
- 本地儲存權限（留言功能）

## 🚀 部署指南

### 方法一：直接部署到 Web 伺服器

1. **檔案上傳**
   ```bash
   # 將整個專案資料夾上傳到 Web 伺服器根目錄
   rsync -avz ./布可星球查詢/ user@server:/var/www/html/book-scanner/
   ```

2. **設定 HTTPS**
   ```apache
   # Apache 設定範例 (.htaccess)
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

3. **檔案權限設定**
   ```bash
   chmod -R 644 /var/www/html/book-scanner/
   chmod 755 /var/www/html/book-scanner/
   ```

### 方法二：使用容器化部署

1. **建立 Dockerfile**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **建構和執行**
   ```bash
   docker build -t book-scanner .
   docker run -d -p 8080:80 book-scanner
   ```

### 方法三：本地開發環境

1. **Python 伺服器**
   ```bash
   cd 布可星球查詢
   python -m http.server 8000 --bind 0.0.0.0
   ```

2. **Node.js 伺服器**
   ```bash
   npx live-server --port=8000 --host=0.0.0.0
   ```

3. **PHP 內建伺服器**
   ```bash
   php -S 0.0.0.0:8000
   ```

## ⚙️ 配置管理

### 主要配置檔案

#### 1. 掃描器設定 (`config/scan_config.json`)
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
    "intervalMs": 120,
    "rotationAngles": [-12, -6, 6, 12]
  },
  "camera": {
    "facingMode": "environment",
    "idealWidth": 1920,
    "idealHeight": 1080,
    "minWidth": 640,
    "minHeight": 480
  },
  "ui": {
    "loadingDelay": 700,
    "popoverDuration": 1500,
    "fadeOutDelay": 300
  }
}
```

#### 2. 書籍清單 (`data/books_list.json`)
```json
[
  {
    "ISBN": "9789573123456",
    "書名": "範例書籍名稱",
    "適合對象": "7-12歲"
  }
]
```

### 配置最佳化建議

#### 高效能環境
```json
{
  "detection": {
    "intervalMs": 80,
    "allowRotation": false,
    "allowSlices": false
  },
  "performance": {
    "maxCanvasWidth": 960
  }
}
```

#### 高準確度環境
```json
{
  "detection": {
    "intervalMs": 150,
    "allowRotation": true,
    "allowSlices": true
  },
  "processing": {
    "contrast": 1.5,
    "sharpen": true,
    "denoise": true
  }
}
```

#### 低光環境
```json
{
  "processing": {
    "brightness": 1.3,
    "contrast": 1.6,
    "gamma": 0.8
  }
}
```

## 📱 操作說明

### 基本操作流程

1. **啟動應用程式**
   - 開啟瀏覽器並導航至應用程式 URL
   - 確認相機權限提示並允許存取

2. **開始掃描**
   - 點擊「🚀 開始掃描條碼」按鈕
   - 等待相機初始化完成

3. **掃描條碼**
   - 將書籍條碼對準畫面中央的框線
   - 保持 15-20 公分距離
   - 確保條碼清晰可見

4. **查看結果**
   - 系統會顯示載入動畫
   - 0.7秒後顯示檢測結果
   - 成功時會顯示書籍資訊和慶祝動畫

5. **停止掃描**
   - 點擊「⏹️ 停止」按鈕
   - 或等待成功檢測後自動停止

### 進階功能

#### 手電筒控制
- **開啟閃光燈**: 點擊「💡開燈」按鈕
- **關閉閃光燈**: 點擊「💡關燈」按鈕
- 自動檢測裝置是否支援閃光燈

#### 留言系統
- 點擊頁面底部的留言按鈕
- 填寫暱稱和留言內容
- 支援回覆功能

#### 統計資訊
- 查看掃描次數、成功率等統計
- 資料儲存在瀏覽器本地儲存

## 🔧 維護指南

### 日常維護任務

#### 1. 書籍清單更新
```bash
# 備份現有清單
cp data/books_list.json data/books_list.json.backup

# 更新清單（使用新的 JSON 檔案）
# 確認 JSON 格式正確性
python -m json.tool data/books_list.json > /dev/null && echo "JSON 格式正確"
```

#### 2. 留言資料管理
```javascript
// 清理過期留言（在瀏覽器控制台執行）
localStorage.removeItem('bookPlanetMessages');
localStorage.removeItem('bookPlanetReplies');
```

#### 3. 配置檔案驗證
```bash
# 驗證配置檔案格式
python -m json.tool config/scan_config.json > /dev/null && echo "配置檔案格式正確"
```

### 定期維護檢查清單

#### 每週檢查
- [ ] 檢查應用程式可正常存取
- [ ] 驗證相機功能運作正常
- [ ] 測試條碼檢測功能
- [ ] 檢查留言系統狀態

#### 每月檢查
- [ ] 更新書籍清單資料
- [ ] 檢查磁碟空間使用情況
- [ ] 清理過期的留言資料
- [ ] 檢查伺服器日誌

#### 每季檢查
- [ ] 備份所有配置和資料檔案
- [ ] 檢查瀏覽器相容性
- [ ] 更新外部依賴庫
- [ ] 效能基準測試

### 備份策略

#### 重要檔案備份
```bash
# 建立完整備份
tar -czf book-scanner-backup-$(date +%Y%m%d).tar.gz \
  config/ data/ assets/ docs/ scan.html

# 僅備份配置和資料
tar -czf book-scanner-data-$(date +%Y%m%d).tar.gz \
  config/ data/
```

#### 自動化備份腳本
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backup/book-scanner"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz \
  config/ data/ scan.html assets/css/scan.css

# 保留最近 7 天的備份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

## 🐛 故障排除

### 常見問題及解決方案

#### 1. 相機無法啟動
**症狀**: 點擊開始掃描後顯示「攝影機啟動失敗」

**可能原因**:
- 瀏覽器沒有相機權限
- 網站不是 HTTPS 協定
- 相機被其他應用程式佔用
- 瀏覽器不支援相機 API

**解決方案**:
```javascript
// 檢查瀏覽器支援
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.log('瀏覽器不支援相機 API');
}

// 重置相機權限（在瀏覽器設定中）
// Chrome: 設定 → 隱私權和安全性 → 網站設定 → 相機
```

#### 2. 條碼檢測不準確
**症狀**: 掃描條碼但無法識別或誤判

**可能原因**:
- 光線不足或過強
- 條碼損壞或模糊
- 距離不當
- 檢測參數不適合

**解決方案**:
```json
// 調整檢測參數 (config/scan_config.json)
{
  "processing": {
    "contrast": 1.5,    // 增加對比度
    "brightness": 1.2,  // 增加亮度
    "denoise": true,    // 啟用降噪
    "sharpen": true     // 啟用銳化
  },
  "detection": {
    "intervalMs": 100,  // 降低檢測間隔
    "allowRotation": true,
    "allowSlices": true
  }
}
```

#### 3. 頁面載入失敗
**症狀**: 無法載入應用程式或顯示錯誤訊息

**可能原因**:
- 檔案路徑錯誤
- 網路連線問題
- 伺服器配置問題
- 快取問題

**解決方案**:
```bash
# 檢查檔案完整性
find . -name "*.json" -exec python -m json.tool {} \; > /dev/null

# 清除瀏覽器快取
# Chrome: Ctrl+Shift+Delete → 選擇時間範圍 → 清除資料

# 檢查網路連線
curl -I https://your-domain.com/scan.html
```

#### 4. 設定檔案載入失敗
**症狀**: 控制台顯示「掃描設定載入失敗，使用預設值」

**可能原因**:
- JSON 格式錯誤
- 檔案權限問題
- 檔案不存在

**解決方案**:
```bash
# 驗證 JSON 格式
python -m json.tool config/scan_config.json

# 檢查檔案權限
ls -la config/scan_config.json

# 重建設定檔案
cp config/scan_config.json.example config/scan_config.json
```

### 除錯工具

#### 瀏覽器開發者工具
1. **按 F12 開啟開發者工具**
2. **Console 面板**: 查看錯誤訊息和日誌
3. **Network 面板**: 檢查資源載入狀態
4. **Application 面板**: 查看本地儲存資料

#### 內建日誌系統
```javascript
// 在控制台查看詳細日誌
console.log(window.state);  // 查看應用程式狀態
console.log(window.state.stats);  // 查看統計資料
```

## 📊 效能優化

### 效能監控指標

#### 載入時間
- **初次載入**: < 3秒
- **資源快取後**: < 1秒
- **配置載入**: < 200ms

#### 檢測效能
- **檢測間隔**: 80-150ms
- **成功率**: > 95%
- **記憶體使用**: < 100MB

### 優化建議

#### 1. 網路優化
```apache
# Apache .htaccess 設定快取
<IfModule mod_expires.c>
ExpiresActive on
ExpiresByType text/css "access plus 1 month"
ExpiresByType application/javascript "access plus 1 month"
ExpiresByType application/json "access plus 1 day"
</IfModule>

# 啟用 Gzip 壓縮
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

#### 2. 資源優化
```bash
# 壓縮 CSS
npx clean-css-cli assets/css/scan.css -o assets/css/scan.min.css

# 壓縮 JSON
python -c "import json; data=json.load(open('data/books_list.json')); json.dump(data, open('data/books_list.min.json', 'w'), separators=(',',':'))"
```

#### 3. 檢測參數調優
```json
// 快速模式（犧牲一些準確度換取速度）
{
  "detection": {
    "intervalMs": 80,
    "allowRotation": false,
    "allowSlices": false
  },
  "performance": {
    "maxCanvasWidth": 960
  }
}

// 平衡模式
{
  "detection": {
    "intervalMs": 120,
    "allowRotation": true,
    "allowSlices": false
  }
}

// 高準確度模式
{
  "detection": {
    "intervalMs": 150,
    "allowRotation": true,
    "allowSlices": true
  }
}
```

## 📈 監控與分析

### 使用情況統計
```javascript
// 查看統計資料
const stats = JSON.parse(localStorage.getItem('bookScannerStats') || '{}');
console.log('總掃描次數:', stats.totalScans);
console.log('成功率:', (stats.successScans / stats.totalScans * 100).toFixed(2) + '%');
```

### 效能基準測試
```javascript
// 效能測試腳本
async function performanceTest() {
  const startTime = performance.now();
  
  // 模擬掃描過程
  for (let i = 0; i < 100; i++) {
    await new Promise(resolve => setTimeout(resolve, 120)); // 模擬檢測間隔
  }
  
  const endTime = performance.now();
  console.log('100次檢測耗時:', (endTime - startTime).toFixed(2) + 'ms');
}
```

---

**文件版本**: v2.0  
**最後更新**: 2025年10月11日  
**適用版本**: 布可星球條碼掃描器 v2.0+