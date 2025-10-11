# 掃描設定檔案說明

## scan_config.json 設定檔案

此檔案包含所有掃描相關的設定參數，在頁面載入時會自動讀取並覆蓋預設值。

### 設定項目說明

#### ROI (Region of Interest) - 感興趣區域
```json
{
  "roi": {
    "enabled": true,           // 是否啟用 ROI
    "widthRatio": 0.78,        // 寬度比例 (0.1-1.0)
    "heightRatio": 0.42        // 高度比例 (0.1-1.0)
  }
}
```

#### 影像處理參數
```json
{
  "processing": {
    "contrast": 1.35,          // 對比度 (0.5-3.0)
    "brightness": 1.05,        // 亮度 (0.5-2.0)
    "gamma": 0.9,              // 伽馬值 (0.1-3.0)
    "denoise": true,           // 是否啟用降噪
    "sharpen": true            // 是否啟用銳化
  }
}
```

#### 檢測設定
```json
{
  "detection": {
    "allowRotation": true,     // 是否允許旋轉檢測
    "allowSlices": true,       // 是否允許切片檢測
    "useBarcodeDetector": true, // 是否使用原生 BarcodeDetector
    "useZxing": true,          // 是否使用 ZXing 引擎
    "intervalMs": 120,         // 檢測間隔毫秒數
    "rotationAngles": [-12, -6, 6, 12], // 旋轉角度陣列
    "slices": [                // 切片設定
      { "label": "中心", "topRatio": 0.25, "heightRatio": 0.5 },
      { "label": "上方", "topRatio": 0.05, "heightRatio": 0.45 },
      { "label": "下方", "topRatio": 0.5, "heightRatio": 0.45 }
    ]
  }
}
```

#### 效能設定
```json
{
  "performance": {
    "logSize": 120,                    // 日誌大小限制
    "maxCanvasWidth": 1280,            // Canvas 最大寬度
    "recentCodeHistorySize": 12        // 最近代碼歷史記錄大小
  }
}
```

#### 相機設定
```json
{
  "camera": {
    "facingMode": "environment",       // 相機模式: "user" | "environment"
    "idealWidth": 1920,                // 理想寬度
    "idealHeight": 1080,               // 理想高度
    "minWidth": 640,                   // 最小寬度
    "minHeight": 480                   // 最小高度
  }
}
```

#### UI 設定
```json
{
  "ui": {
    "loadingDelay": 700,               // 載入延遲毫秒數
    "popoverDuration": 1500,           // Popover 顯示時間毫秒數
    "fadeOutDelay": 300                // 淡出延遲毫秒數
  }
}
```

### 使用方式

1. 直接修改 `scan_config.json` 檔案中的數值
2. 重新載入頁面，設定會自動套用
3. 如果設定檔案載入失敗，系統會使用程式碼中的預設值

### 注意事項

- 設定檔案必須是有效的 JSON 格式
- 數值範圍請參考上述說明，超出範圍可能導致異常
- 修改設定後需要重新載入頁面才會生效
- 建議先備份原始設定檔案再進行修改

### 常用調整建議

**提升檢測速度:**
- 降低 `intervalMs` (如 80-100)
- 關閉 `allowRotation` 或 `allowSlices`
- 降低 `maxCanvasWidth` (如 960)

**提升檢測準確度:**
- 增加 `intervalMs` (如 150-200)
- 啟用所有檢測選項
- 調整影像處理參數

**適應不同環境:**
- 調整 `contrast` 和 `brightness`
- 修改 `roi` 的 `widthRatio` 和 `heightRatio`
- 調整相機解析度設定