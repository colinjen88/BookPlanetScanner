# 專案整理策略規劃書

## 📊 現狀分析 (2025年10月11日)

### 檔案統計
- **總檔案數**: 3,575 個檔案
- **總目錄數**: 533 個目錄  
- **總體大小**: 61.37 MB
- **實際專案大小**: 2.24 MB (僅佔 3.6%)

### 空間佔用分析
| 組件 | 大小 | 佔比 | 狀態 |
|------|------|------|------|
| .venv/ | 58.4 MB | 95.2% | ❌ 需排除 |
| .git/ | 805 KB | 1.3% | ✅ 正常 |
| 實際專案 | 2.24 MB | 3.6% | ✅ 核心內容 |

## 🎯 整理目標

### 主要問題
1. **虛擬環境污染**: .venv 佔用 95% 空間，不應納入版本控制
2. **臨時檔案堆積**: project_inventory.csv (701KB) 等臨時檔案
3. **文檔重複**: README.md 在根目錄和 docs/ 都存在
4. **缺乏 .gitignore**: 未正確排除不必要檔案

### 優化目標
- 清理後專案大小控制在 **2.5 MB** 以內
- 建立清晰的目錄結構
- 完善版本控制配置
- 提升專案專業度和維護性

## 📁 目標目錄結構

```
布可星球條碼掃描器/
├── 📄 README.md                    # 主要專案說明
├── 📄 package.json                 # 專案配置
├── 📄 .gitignore                   # 版本控制排除規則
├── 📄 scan.html                    # 🎯 核心應用程式
│
├── 📁 src/                         # 源碼目錄 (新增)
│   ├── css/
│   │   └── scan.css               # 樣式檔案
│   └── js/
│       ├── app.js                 # 主要邏輯
│       ├── scanner.js             # 掃描功能
│       ├── ui-utils.js            # UI 工具
│       └── data-manager.js        # 資料管理
│
├── 📁 config/                      # 配置檔案
│   └── scan_config.json          # 掃描配置
│
├── 📁 data/                        # 資料檔案
│   ├── books_list.json           # 主要書籍資料
│   ├── messages.json             # 使用者留言
│   └── stats.json                # 統計資料
│
├── 📁 docs/                        # 完整文檔系統
│   ├── user/                     # 使用者文檔
│   │   ├── README.md             # 使用說明
│   │   └── TROUBLESHOOTING.md    # 故障排除
│   ├── dev/                      # 開發者文檔
│   │   ├── API_REFERENCE.md      # API 參考
│   │   └── DEPLOYMENT_GUIDE.md   # 部署指南
│   └── project/                  # 專案文檔
│       ├── VERSION.md            # 版本資訊
│       ├── CHANGELOG.md          # 變更日誌
│       └── ARCHITECTURE.md       # 架構說明
│
├── 📁 tools/                       # 開發工具 (新增)
│   ├── optimize.ps1              # 優化腳本
│   ├── optimize.sh               # 跨平台優化
│   ├── validate.ps1              # 驗證腳本
│   └── cleanup.ps1               # 清理腳本
│
├── 📁 scripts/                     # 資料處理腳本 (整理自爬蟲程式/)
│   ├── isbn_batch.py             # 批次處理
│   ├── isbn_continue.py          # 繼續處理
│   ├── memory_cleaner.py         # 記憶體清理
│   └── config/
│       └── myapikey.json         # API 配置
│
└── 📁 archive/                     # 歷史檔案 (整理自中文資料夾)
    ├── development/              # 開發歷史
    │   ├── execution-log.md      # 執行記錄
    │   └── architecture-notes.md # 架構筆記
    ├── data/                     # 歷史資料
    │   ├── original/             # 原始資料
    │   └── progress/             # 進度檔案
    └── legacy/                   # 舊版檔案
        └── old-implementations/
```

## 🔧 執行計劃

### 第一階段：清理和安全措施
1. ✅ 建立 .gitignore 檔案
2. 🔄 移除臨時檔案 (project_inventory.csv)
3. 🔄 備份重要檔案
4. 🔄 記錄當前 Git 狀態

### 第二階段：目錄重構
1. 建立新的目錄結構
2. 重新組織 assets/ → src/
3. 整理文檔到 docs/ 子目錄
4. 移動工具腳本到 tools/
5. 整理中文資料夾到 archive/

### 第三階段：檔案整合
1. 解決 README.md 重複問題
2. 整合相關文檔
3. 更新檔案內部路徑引用
4. 驗證所有功能正常

### 第四階段：最終優化
1. 清理無用檔案
2. 壓縮和優化資源
3. 更新配置檔案路徑
4. 生成最終報告

## 📋 檔案處理規則

### 保留檔案 (核心功能)
- `scan.html` - 主應用程式
- `assets/` 內容 → 移至 `src/`
- `config/scan_config.json` - 配置檔案
- `data/books_list.json` - 主要資料

### 重新組織檔案
- `爬蟲程式/` → `scripts/`
- `文件說明/` → `archive/development/`
- `原始資料/` → `archive/data/original/`
- `進度檔案/` → `archive/data/progress/`

### 文檔整理
- 根目錄 `README.md` → 保留作為主要說明
- `docs/README.md` → 重新命名或整合
- 專案文檔按類型分組到 docs/ 子目錄

### 刪除檔案
- `project_inventory.csv` - 臨時分析檔案
- `.venv/` - 虛擬環境 (已在 .gitignore 中排除)
- 任何 `*.tmp`, `*.bak` 備份檔案

## ⚠️ 風險控制

### 備份策略
1. 執行前完整 Git commit
2. 建立專案壓縮備份
3. 分步驟執行，每步驗證
4. 保留 rollback 腳本

### 驗證檢查點
1. 核心應用 scan.html 功能正常
2. 配置檔案載入正確
3. 資料檔案存取無誤
4. 所有工具腳本可執行

## 📈 預期成果

### 量化指標
- **檔案數量**: 3,575 → ~50 (減少 98.6%)
- **專案大小**: 61.37MB → ~2.5MB (減少 95.9%)
- **目錄層級**: 更清晰的 3-4 層結構
- **維護複雜度**: 大幅降低

### 質化改進
- ✅ 清晰的專案結構
- ✅ 完善的版本控制
- ✅ 專業的文檔組織
- ✅ 便於維護和擴展
- ✅ 符合開源專案標準

## 🎯 後續維護

### 定期任務
- 每月執行 validate.ps1 檢查
- 季度執行 optimize.ps1 優化
- 版本更新時整理 archive/

### 長期規劃
- 建立 CI/CD 自動化
- 加強測試覆蓋
- 文檔國際化
- 社群貢獻指南

---

**制定日期**: 2025年10月11日  
**執行時間估計**: 2-3 小時  
**風險等級**: 低 (有完整備份和驗證)  
**優先級**: 高 (影響專案長期維護性)**