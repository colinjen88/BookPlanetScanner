# 專案結構清理腳本
# Project Structure Cleanup Script

Write-Host "=== 布可星球條碼掃描器 - 專案清理開始 ===" -ForegroundColor Magenta
Write-Host ""

# 檢查並移除空資料夾
function Remove-EmptyDirectories {
    Write-Host "移除空資料夾..." -ForegroundColor Cyan
    
    $emptyDirs = @()
    
    # 檢查 js 資料夾
    if (Test-Path "js") {
        $jsFiles = Get-ChildItem "js" -Force
        if ($jsFiles.Count -eq 0) {
            $emptyDirs += "js"
            Write-Host "  發現空資料夾: js" -ForegroundColor Yellow
        }
    }
    
    # 移除空資料夾
    foreach ($dir in $emptyDirs) {
        try {
            Remove-Item $dir -Force -Recurse
            Write-Host "  ✅ 已移除空資料夾: $dir" -ForegroundColor Green
        }
        catch {
            Write-Host "  ❌ 無法移除資料夾: $dir - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($emptyDirs.Count -eq 0) {
        Write-Host "  ✅ 未發現空資料夾" -ForegroundColor Green
    }
}

# 處理重複的檔案
function Remove-DuplicateFiles {
    Write-Host "處理重複檔案..." -ForegroundColor Cyan
    
    # 檢查根目錄的 app.js
    if (Test-Path "app.js") {
        Write-Host "  發現根目錄的 app.js" -ForegroundColor Yellow
        
        # 檢查 assets/js/app.js 是否存在且內容更完整
        if (Test-Path "assets/js/app.js") {
            $rootSize = (Get-Item "app.js").Length
            $assetsSize = (Get-Item "assets/js/app.js").Length
            
            Write-Host "  根目錄 app.js 大小: $rootSize bytes" -ForegroundColor Gray
            Write-Host "  assets/js/app.js 大小: $assetsSize bytes" -ForegroundColor Gray
            
            # 保留較大的檔案（通常內容更完整）
            if ($assetsSize -ge $rootSize) {
                try {
                    Remove-Item "app.js" -Force
                    Write-Host "  ✅ 已移除根目錄的重複 app.js" -ForegroundColor Green
                }
                catch {
                    Write-Host "  ❌ 無法移除 app.js: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "  ⚠️ 根目錄 app.js 較大，請手動檢查內容" -ForegroundColor Yellow
            }
        }
    }
    
    # 檢查其他可能的重複檔案
    $duplicatePatterns = @("*_backup.*", "*_old.*", "*.bak")
    foreach ($pattern in $duplicatePatterns) {
        $duplicates = Get-ChildItem -Filter $pattern -Recurse -File
        if ($duplicates.Count -gt 0) {
            Write-Host "  發現備份檔案:" -ForegroundColor Yellow
            foreach ($file in $duplicates) {
                Write-Host "    - $($file.FullName)" -ForegroundColor Gray
            }
        }
    }
}

# 整理文檔結構
function Organize-Documentation {
    Write-Host "整理文檔結構..." -ForegroundColor Cyan
    
    # 檢查是否有重複的 README.md
    $readmeFiles = @()
    if (Test-Path "README.md") { $readmeFiles += "根目錄/README.md" }
    if (Test-Path "docs/README.md") { $readmeFiles += "docs/README.md" }
    
    if ($readmeFiles.Count -gt 1) {
        Write-Host "  發現多個 README.md 檔案:" -ForegroundColor Yellow
        foreach ($readme in $readmeFiles) {
            Write-Host "    - $readme" -ForegroundColor Gray
        }
        Write-Host "  建議: 保留根目錄的 README.md 作為專案主要說明" -ForegroundColor Cyan
    }
    
    # 檢查文檔檔案的重複性
    $docsInRoot = Get-ChildItem "*.md" -File | Where-Object { $_.Name -ne "README.md" }
    if ($docsInRoot.Count -gt 0) {
        Write-Host "  根目錄中的文檔檔案:" -ForegroundColor Yellow
        foreach ($doc in $docsInRoot) {
            Write-Host "    - $($doc.Name)" -ForegroundColor Gray
            
            # 檢查 docs 資料夾中是否有相同檔案
            if (Test-Path "docs/$($doc.Name)") {
                Write-Host "      ⚠️ docs 資料夾中也有同名檔案" -ForegroundColor Yellow
            }
        }
    }
}

# 檢查中文資料夾結構
function Review-ChineseFolders {
    Write-Host "檢查中文資料夾..." -ForegroundColor Cyan
    
    $chineseFolders = @("文件說明", "爬蟲程式", "原始資料", "進度檔案")
    
    foreach ($folder in $chineseFolders) {
        if (Test-Path $folder) {
            $fileCount = (Get-ChildItem $folder -Recurse -File | Measure-Object).Count
            Write-Host "  📁 $folder - $fileCount 個檔案" -ForegroundColor Gray
        }
    }
    
    Write-Host "  建議保持這些資料夾，它們包含重要的歷史和參考資料" -ForegroundColor Cyan
}

# 建議的最佳目錄結構
function Show-RecommendedStructure {
    Write-Host "建議的專案結構:" -ForegroundColor Cyan
    
    $structure = @"
專案根目錄/
├── scan.html                 # 主應用程式
├── README.md                # 專案說明
├── assets/                  # 資源檔案
│   ├── css/scan.css        # 樣式檔案
│   └── js/                 # JavaScript 檔案
│       ├── app.js          # 主要應用邏輯
│       ├── scanner.js      # 掃描功能
│       └── ui-utils.js     # UI 工具函數
├── config/                 # 配置檔案
│   └── scan_config.json   # 掃描配置
├── data/                   # 資料檔案
│   ├── books_list.json    # 書籍清單
│   └── messages.json      # 使用者留言
├── docs/                   # 專案文檔
│   ├── API_REFERENCE.md   # API 參考
│   └── DEPLOYMENT_GUIDE.md # 部署指南
├── 文件說明/               # 歷史文檔（保留）
├── 爬蟲程式/               # 資料處理工具（保留）
└── 原始資料/               # 原始數據（保留）
"@
    
    Write-Host $structure -ForegroundColor Gray
}

# 執行清理操作
function Start-Cleanup {
    param(
        [switch]$DryRun = $false
    )
    
    if ($DryRun) {
        Write-Host "=== 乾跑模式 - 僅檢查，不進行實際清理 ===" -ForegroundColor Yellow
        Write-Host ""
    }
    
    Remove-EmptyDirectories
    Write-Host ""
    
    if (-not $DryRun) {
        Remove-DuplicateFiles
        Write-Host ""
    }
    
    Organize-Documentation  
    Write-Host ""
    
    Review-ChineseFolders
    Write-Host ""
    
    Show-RecommendedStructure
    Write-Host ""
    
    Write-Host "=== 清理完成 ===" -ForegroundColor Green
}

# 檢查參數
param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

if ($DryRun) {
    Start-Cleanup -DryRun
}
else {
    if ($Force) {
        Start-Cleanup
    }
    else {
        Write-Host "執行清理操作前，建議先進行檢查:" -ForegroundColor Yellow
        Write-Host "  ./cleanup.ps1 -DryRun    # 檢查模式" -ForegroundColor Cyan
        Write-Host "  ./cleanup.ps1 -Force     # 執行清理" -ForegroundColor Cyan
        Write-Host ""
        Start-Cleanup -DryRun
    }
}