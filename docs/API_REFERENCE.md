# 布可星球條碼掃描器 - API 與開發者文檔

## 📋 目錄
1. [API 概覽](#api-概覽)
2. [配置 API](#配置-api)
3. [掃描引擎 API](#掃描引擎-api)
4. [資料處理 API](#資料處理-api)
5. [事件系統](#事件系統)
6. [開發指南](#開發指南)
7. [擴展接口](#擴展接口)

## 🔌 API 概覽

### 全域物件
應用程式在 `window` 物件上暴露了以下 API：

```javascript
window.state          // 應用程式狀態
window.loadScanConfig // 載入配置函數
window.reloadMessages // 重新載入留言
window.clearAllMessages // 清除所有留言
```

### 核心模組
```javascript
// 狀態管理
const state = window.state;

// 檢測引擎
const detectors = state.detectors;

// 統計資料
const stats = state.stats;
```

## ⚙️ 配置 API

### 1. 載入配置
```javascript
/**
 * 載入外部配置檔案
 * @returns {Promise<void>}
 */
async function loadScanConfig() {
  try {
    const response = await fetch('config/scan_config.json');
    const config = await response.json();
    
    // 合併配置到狀態
    Object.assign(state.roi, config.roi);
    Object.assign(state.processing, config.processing);
    // ... 其他配置
  } catch (error) {
    console.log('配置載入失敗，使用預設值');
  }
}
```

### 2. 動態配置更新
```javascript
/**
 * 動態更新掃描配置
 * @param {Object} newConfig - 新配置物件
 */
function updateScanConfig(newConfig) {
  if (newConfig.roi) {
    Object.assign(state.roi, newConfig.roi);
  }
  
  if (newConfig.processing) {
    Object.assign(state.processing, newConfig.processing);
  }
  
  if (newConfig.detection) {
    Object.assign(state.detection, newConfig.detection);
  }
  
  console.log('配置已更新:', newConfig);
}

// 使用範例
updateScanConfig({
  processing: {
    contrast: 1.5,
    brightness: 1.2
  },
  detection: {
    intervalMs: 100
  }
});
```

### 3. 配置驗證
```javascript
/**
 * 驗證配置物件的有效性
 * @param {Object} config - 配置物件
 * @returns {boolean} 是否有效
 */
function validateConfig(config) {
  const validations = [
    // ROI 驗證
    () => !config.roi || (
      typeof config.roi.widthRatio === 'number' && 
      config.roi.widthRatio > 0 && config.roi.widthRatio <= 1
    ),
    
    // 處理參數驗證
    () => !config.processing || (
      config.processing.contrast >= 0.5 && config.processing.contrast <= 3.0 &&
      config.processing.brightness >= 0.5 && config.processing.brightness <= 2.0
    ),
    
    // 檢測參數驗證
    () => !config.detection || (
      config.detection.intervalMs >= 50 && config.detection.intervalMs <= 1000
    )
  ];
  
  return validations.every(validation => validation());
}
```

## 🔍 掃描引擎 API

### 1. 檢測引擎初始化
```javascript
/**
 * 初始化檢測引擎
 */
function initDetectors() {
  // BarcodeDetector API
  if ('BarcodeDetector' in window) {
    state.detectors.barcodeDetector = new BarcodeDetector({ 
      formats: SUPPORTED_FORMATS 
    });
  }
  
  // ZXing 引擎（延遲初始化）
  setTimeout(() => {
    if (typeof ZXing !== 'undefined') {
      const reader = new ZXing.MultiFormatReader();
      const hints = new Map();
      hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS);
      reader.setHints(hints);
      state.detectors.multiFormatReader = reader;
    }
  }, 1000);
}
```

### 2. 條碼檢測 API
```javascript
/**
 * 使用原生 BarcodeDetector 檢測條碼
 * @param {HTMLCanvasElement} canvas - 要檢測的 Canvas
 * @returns {Promise<Object|null>} 檢測結果
 */
async function detectWithBarcodeDetector(canvas) {
  const detector = state.detectors.barcodeDetector;
  if (!detector || !state.detection.useBarcodeDetector) return null;
  
  try {
    const detections = await detector.detect(canvas);
    if (!detections || detections.length === 0) return null;
    
    const best = detections[0];
    return {
      text: best.rawValue,
      engine: 'BarcodeDetector',
      format: best.format || 'Unknown'
    };
  } catch (error) {
    console.log('BarcodeDetector 檢測失敗:', error.message);
    return null;
  }
}

/**
 * 使用 ZXing 檢測條碼
 * @param {HTMLCanvasElement} canvas - 要檢測的 Canvas
 * @returns {Object|null} 檢測結果
 */
function detectWithZxing(canvas) {
  const reader = state.detectors.multiFormatReader;
  if (!reader || !state.detection.useZxing) return null;
  
  try {
    const luminanceSource = new ZXingBrowser.HTMLCanvasElementLuminanceSource(canvas);
    const binaryBitmap = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(luminanceSource));
    const result = reader.decodeWithState(binaryBitmap);
    
    if (reader.reset) reader.reset();
    
    return {
      text: result.getText(),
      engine: 'ZXing',
      format: result.getBarcodeFormat().toString()
    };
  } catch (error) {
    if (reader.reset) reader.reset();
    return null;
  }
}
```

### 3. 智慧檢測策略
```javascript
/**
 * 綜合檢測策略
 * @param {HTMLCanvasElement} canvas - 要檢測的 Canvas
 * @param {string} stageLabel - 檢測階段標籤
 * @returns {Promise<Object|null>} 檢測結果
 */
async function detectFromCanvas(canvas, stageLabel) {
  // 優先使用原生 API
  let detection = await detectWithBarcodeDetector(canvas);
  if (detection) {
    detection.stage = stageLabel;
    return detection;
  }
  
  // 備用 ZXing 引擎
  detection = detectWithZxing(canvas);
  if (detection) {
    detection.stage = stageLabel;
    return detection;
  }
  
  return null;
}
```

## 📊 資料處理 API

### 1. 書籍匹配算法
```javascript
/**
 * 進階條碼處理器
 * @param {string} rawCode - 原始條碼
 * @returns {Array<string>} 處理後的候選條碼
 */
function advancedBarcodeProcessor(rawCode) {
  const cleaned = rawCode.replace(/\D/g, '');
  const results = new Set();
  
  if (!cleaned) return [];
  
  // 加入清理後的原始碼
  results.add(cleaned);
  
  // 標準長度處理
  if (cleaned.length === 18) results.add(cleaned.slice(0, 13));
  if (cleaned.length === 15) results.add(cleaned.slice(0, 10));
  if (cleaned.length > 13) results.add(cleaned.slice(0, 13));
  if (cleaned.length > 10) results.add(cleaned.slice(0, 10));
  
  // 去除校驗碼
  if (cleaned.length > 8) {
    results.add(cleaned.slice(0, cleaned.length - 1));
  }
  
  // 滑動視窗處理
  if (cleaned.length >= 10) {
    for (let i = 0; i <= cleaned.length - 10; i++) {
      const slice13 = cleaned.slice(i, i + 13);
      const slice10 = cleaned.slice(i, i + 10);
      
      if (slice13.length === 13) results.add(slice13);
      if (slice10.length === 10) results.add(slice10);
    }
  }
  
  return Array.from(results).filter(code => code.length >= 8);
}

/**
 * 智慧書籍匹配
 * @param {string} rawCode - 原始條碼
 * @returns {Object} 匹配結果
 */
function intelligentBookMatch(rawCode) {
  const candidates = advancedBarcodeProcessor(rawCode);
  
  for (const candidate of candidates) {
    const match = state.bookList.find(book => {
      if (!book.ISBN) return false;
      
      const normalized = book.ISBN.replace(/\D/g, '');
      
      // 完全匹配
      if (normalized === candidate) return true;
      
      // 校驗碼差異容忍
      if (normalized.length === candidate.length &&
          normalized.substring(0, normalized.length - 1) === 
          candidate.substring(0, candidate.length - 1)) {
        return true;
      }
      
      // 部分包含匹配
      if (normalized.includes(candidate) || candidate.includes(normalized)) {
        return Math.abs(normalized.length - candidate.length) <= 2;
      }
      
      return false;
    });
    
    if (match) {
      return {
        found: match,
        matchedCode: candidate,
        original: rawCode
      };
    }
  }
  
  return {
    found: null,
    matchedCode: candidates[0] || '',
    original: rawCode
  };
}
```

### 2. 影像處理 API
```javascript
/**
 * 應用影像處理效果
 * @param {ImageData} imageData - 影像資料
 * @param {number} width - 寬度
 * @param {number} height - 高度
 */
function applyImageProcessing(imageData, width, height) {
  const data = imageData.data;
  const { contrast, brightness, gamma } = state.processing;
  
  // 基本處理
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // 轉為灰度
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // 應用亮度
    gray = gray * brightness;
    
    // 應用對比度
    gray = (gray - 128) * contrast + 128;
    
    // 應用伽馬校正
    gray = 255 * Math.pow(clamp(gray) / 255, gamma);
    
    const value = clamp(gray);
    data[i] = data[i + 1] = data[i + 2] = value;
  }
  
  // 後處理
  if (state.processing.denoise) {
    applyBoxBlur(imageData, width, height);
  }
  
  if (state.processing.sharpen) {
    applyUnsharpMask(imageData, width, height);
  }
}

/**
 * 數值限制函數
 * @param {number} value - 輸入值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制後的值
 */
function clamp(value, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}
```

## 📡 事件系統

### 1. 自定義事件
```javascript
// 書籍載入完成事件
window.dispatchEvent(new CustomEvent('booksLoaded', {
  detail: { count: state.bookList.length }
}));

// 掃描成功事件
window.dispatchEvent(new CustomEvent('scanSuccess', {
  detail: { 
    book: matchResult.found,
    code: detection.text,
    engine: detection.engine
  }
}));

// 配置更新事件
window.dispatchEvent(new CustomEvent('configUpdated', {
  detail: { config: newConfig }
}));
```

### 2. 事件監聽器
```javascript
// 監聽書籍載入事件
window.addEventListener('booksLoaded', (event) => {
  console.log(`載入了 ${event.detail.count} 本書`);
});

// 監聽掃描成功事件
window.addEventListener('scanSuccess', (event) => {
  const { book, code, engine } = event.detail;
  console.log(`成功掃描：${book.書名} (${code}) via ${engine}`);
});

// 監聽配置更新事件
window.addEventListener('configUpdated', (event) => {
  console.log('配置已更新:', event.detail.config);
});
```

### 3. 狀態變化監聽
```javascript
/**
 * 狀態監聽器工廠
 * @param {Object} target - 目標物件
 * @param {Function} callback - 回調函數
 * @returns {Proxy} 代理物件
 */
function createStateWatcher(target, callback) {
  return new Proxy(target, {
    set(obj, prop, value) {
      const oldValue = obj[prop];
      obj[prop] = value;
      callback(prop, value, oldValue);
      return true;
    }
  });
}

// 監聽統計資料變化
const watchedStats = createStateWatcher(state.stats, (prop, newVal, oldVal) => {
  console.log(`統計 ${prop} 從 ${oldVal} 變為 ${newVal}`);
});
```

## 🛠️ 開發指南

### 1. 本地開發環境設置
```bash
# 安裝開發依賴
npm install --save-dev live-server eslint prettier

# 啟動開發伺服器
npm run dev

# 程式碼檢查
npm run lint

# 格式化程式碼
npm run format
```

### 2. 除錯工具
```javascript
// 開啟除錯模式
window.DEBUG = true;

// 除錯日誌函數
function debugLog(message, ...args) {
  if (window.DEBUG) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

// 效能監控
function performanceMonitor(fn, label) {
  return function(...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    debugLog(`${label} 執行時間: ${(end - start).toFixed(2)}ms`);
    return result;
  };
}

// 使用範例
const monitoredDetection = performanceMonitor(detectFromCanvas, '條碼檢測');
```

### 3. 測試工具
```javascript
/**
 * 模擬掃描測試
 * @param {string} testCode - 測試條碼
 * @returns {Object} 測試結果
 */
function simulateScan(testCode) {
  console.log(`模擬掃描: ${testCode}`);
  
  const match = intelligentBookMatch(testCode);
  console.log('匹配結果:', match);
  
  if (match.found) {
    console.log(`✅ 找到書籍: ${match.found.書名}`);
  } else {
    console.log('❌ 未找到匹配書籍');
  }
  
  return match;
}

/**
 * 批次測試
 * @param {Array<string>} testCodes - 測試條碼陣列
 */
function batchTest(testCodes) {
  const results = testCodes.map(code => ({
    code,
    result: simulateScan(code)
  }));
  
  const successRate = results.filter(r => r.result.found).length / results.length;
  console.log(`批次測試完成，成功率: ${(successRate * 100).toFixed(2)}%`);
  
  return results;
}
```

## 🔌 擴展接口

### 1. 自定義檢測引擎
```javascript
/**
 * 註冊自定義檢測引擎
 * @param {string} name - 引擎名稱
 * @param {Function} detectFunction - 檢測函數
 */
function registerDetectionEngine(name, detectFunction) {
  state.detectors[name] = detectFunction;
  state.detection[`use${name}`] = true;
  
  console.log(`已註冊檢測引擎: ${name}`);
}

// 使用範例：註冊 QuaggaJS 引擎
registerDetectionEngine('quagga', async function(canvas) {
  return new Promise((resolve) => {
    Quagga.decodeSingle({
      decoder: { readers: ["code_128_reader", "ean_reader", "ean_8_reader"] },
      locate: true,
      src: canvas.toDataURL()
    }, (result) => {
      if (result && result.codeResult) {
        resolve({
          text: result.codeResult.code,
          engine: 'QuaggaJS',
          format: result.codeResult.format
        });
      } else {
        resolve(null);
      }
    });
  });
});
```

### 2. 自定義影像處理濾鏡
```javascript
/**
 * 註冊自定義影像濾鏡
 * @param {string} name - 濾鏡名稱
 * @param {Function} filterFunction - 濾鏡函數
 */
function registerImageFilter(name, filterFunction) {
  state.processing.filters = state.processing.filters || {};
  state.processing.filters[name] = filterFunction;
  
  console.log(`已註冊影像濾鏡: ${name}`);
}

// 使用範例：高斯模糊濾鏡
registerImageFilter('gaussianBlur', function(imageData, width, height, radius = 2) {
  // 高斯模糊實現
  const data = imageData.data;
  const kernel = generateGaussianKernel(radius);
  
  // ... 濾鏡實現邏輯
  
  return imageData;
});
```

### 3. 插件系統
```javascript
/**
 * 插件管理器
 */
const PluginManager = {
  plugins: new Map(),
  
  /**
   * 註冊插件
   * @param {string} name - 插件名稱
   * @param {Object} plugin - 插件物件
   */
  register(name, plugin) {
    if (typeof plugin.init === 'function') {
      plugin.init(state);
    }
    
    this.plugins.set(name, plugin);
    console.log(`插件已註冊: ${name}`);
  },
  
  /**
   * 取得插件
   * @param {string} name - 插件名稱
   * @returns {Object} 插件物件
   */
  get(name) {
    return this.plugins.get(name);
  },
  
  /**
   * 執行所有插件的特定方法
   * @param {string} method - 方法名稱
   * @param {...any} args - 參數
   */
  executeAll(method, ...args) {
    for (const [name, plugin] of this.plugins) {
      if (typeof plugin[method] === 'function') {
        try {
          plugin[method](...args);
        } catch (error) {
          console.error(`插件 ${name} 的 ${method} 方法執行失敗:`, error);
        }
      }
    }
  }
};

// 使用範例：統計插件
PluginManager.register('statistics', {
  init(state) {
    this.stats = {
      totalDetections: 0,
      successfulDetections: 0,
      engines: {}
    };
  },
  
  onDetection(detection) {
    this.stats.totalDetections++;
    
    if (detection) {
      this.stats.successfulDetections++;
      const engine = detection.engine;
      this.stats.engines[engine] = (this.stats.engines[engine] || 0) + 1;
    }
  },
  
  getReport() {
    return {
      ...this.stats,
      successRate: this.stats.successfulDetections / this.stats.totalDetections
    };
  }
});
```

## 📝 API 使用範例

### 完整的自定義掃描實現
```javascript
class CustomScanner {
  constructor(config = {}) {
    this.config = { ...state, ...config };
    this.isRunning = false;
  }
  
  async start() {
    if (this.isRunning) return;
    
    // 初始化相機
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: this.config.cameraConfig
    });
    
    this.video = document.createElement('video');
    this.video.srcObject = this.stream;
    await this.video.play();
    
    this.isRunning = true;
    this.scanLoop();
  }
  
  async scanLoop() {
    while (this.isRunning) {
      const detection = await this.processFrame();
      
      if (detection) {
        const match = intelligentBookMatch(detection.text);
        this.onResult(match, detection);
        
        if (match.found) {
          this.stop();
          break;
        }
      }
      
      await new Promise(resolve => 
        setTimeout(resolve, this.config.detection.intervalMs)
      );
    }
  }
  
  async processFrame() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    
    ctx.drawImage(this.video, 0, 0);
    
    // 應用影像處理
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyImageProcessing(imageData, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    // 檢測條碼
    return await detectFromCanvas(canvas, 'CustomScanner');
  }
  
  stop() {
    this.isRunning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
  
  onResult(match, detection) {
    console.log('掃描結果:', { match, detection });
  }
}

// 使用範例
const scanner = new CustomScanner({
  detection: { intervalMs: 100 },
  processing: { contrast: 1.5 }
});

scanner.onResult = (match, detection) => {
  if (match.found) {
    console.log(`找到書籍: ${match.found.書名}`);
  }
};

scanner.start();
```

---

**文件版本**: v2.0  
**最後更新**: 2025年10月11日  
**API 版本**: v2.0+