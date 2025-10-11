# 布可星球條碼掃描器 - 專案清理與優化腳本 (PowerShell)
# Project Cleanup and Optimization Script

param(
    [switch]$SkipBackup,
    [switch]$Verbose,
    [switch]$QuickCheck
)

# 設定錯誤處理
$ErrorActionPreference = "Stop"

# 顏色定義
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Success" { Write-Host "✅ [SUCCESS] $Message" -ForegroundColor Green }
        "Warning" { Write-Host "⚠️  [WARNING] $Message" -ForegroundColor Yellow }
        "Error" { Write-Host "❌ [ERROR] $Message" -ForegroundColor Red }
        "Info" { Write-Host "ℹ️  [INFO] $Message" -ForegroundColor Cyan }
    }
}

# 開始優化
Write-Host "🚀 布可星球條碼掃描器 - 專案優化開始" -ForegroundColor Magenta
Write-Host "================================================" -ForegroundColor Magenta
Write-Host ""

# 檢查 PowerShell 版本
function Test-PowerShellVersion {
    Write-ColorOutput "檢查 PowerShell 版本..." "Info"
    
    $version = $PSVersionTable.PSVersion
    if ($version.Major -lt 5) {
        Write-ColorOutput "需要 PowerShell 5.0 或更高版本，當前版本: $($version)" "Error"
        exit 1
    }
    
    Write-ColorOutput "PowerShell 版本: $($version) ✓" "Success"
}

# 檢查必要模組
function Test-RequiredModules {
    Write-ColorOutput "檢查必要模組..." "Info"
    
    $requiredModules = @()
    $availableModules = Get-Module -ListAvailable
    
    # 檢查 JSON 處理能力
    try {
        ConvertTo-Json @{test = "value"} | Out-Null
        Write-ColorOutput "JSON 處理模組 ✓" "Success"
    }
    catch {
        Write-ColorOutput "JSON 處理模組不可用" "Error"
    }
}

# 驗證 JSON 檔案格式
function Test-JsonFiles {
    Write-ColorOutput "驗證 JSON 檔案格式..." "Info"
    
    $jsonFiles = @(
        "config/scan_config.json",
        "data/books_list.json",
        "data/messages.json",
        "data/stats.json"
    )
    
    $validCount = 0
    $totalCount = $jsonFiles.Length
    
    foreach ($file in $jsonFiles) {
        if (Test-Path $file) {
            try {
                $content = Get-Content $file -Raw | ConvertFrom-Json
                Write-ColorOutput "✓ $file 格式正確" "Success"
                $validCount++
            }
            catch {
                Write-ColorOutput "✗ $file 格式錯誤: $($_.Exception.Message)" "Error"
            }
        }
        else {
            Write-ColorOutput "⚠ $file 檔案不存在" "Warning"
        }
    }
    
    Write-ColorOutput "JSON 檔案驗證完成: $validCount/$totalCount 個檔案格式正確" "Info"
    return $validCount -eq $totalCount
}

# 清理臨時和備份檔案
function Clear-TempFiles {
    Write-ColorOutput "清理臨時和備份檔案..." "Info"
    
    $cleanupPatterns = @(
        "*.tmp",
        "*.bak",
        "*.backup",
        "*~",
        ".DS_Store",
        "Thumbs.db",
        "*.log"
    )
    
    $deletedCount = 0
    
    foreach ($pattern in $cleanupPatterns) {
        $files = Get-ChildItem -Path . -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            try {
                Remove-Item $file.FullName -Force
                if ($Verbose) {
                    Write-ColorOutput "刪除: $($file.FullName)" "Success"
                }
                $deletedCount++
            }
            catch {
                Write-ColorOutput "無法刪除: $($file.FullName)" "Warning"
            }
        }
    }
    
    Write-ColorOutput "清理完成，共刪除 $deletedCount 個檔案" "Info"
}

# 優化資料檔案
function Optimize-DataFiles {
    Write-ColorOutput "優化資料檔案..." "Info"
    
    $jsonFiles = @("config/scan_config.json", "data/books_list.json")
    
    foreach ($file in $jsonFiles) {
        if (Test-Path $file) {
            try {
                $originalSize = (Get-Item $file).Length
                $content = Get-Content $file -Raw | ConvertFrom-Json
                $compressedContent = $content | ConvertTo-Json -Compress
                
                Set-Content -Path $file -Value $compressedContent -Encoding UTF8
                $newSize = (Get-Item $file).Length
                $saved = $originalSize - $newSize
                
                if ($saved -gt 0) {
                    Write-ColorOutput "Optimized ${file}: Saved $saved bytes" "Success"
                }
                else {
                    Write-ColorOutput "Optimized ${file}: Already optimal" "Info"
                }
            }
            catch {
                Write-ColorOutput "Cannot optimize ${file}: $($_.Exception.Message)" "Warning"
            }
        }
    }
    
    # 檢查留言資料
    if (Test-Path "data/messages.json") {
        try {
            $messages = Get-Content "data/messages.json" -Raw | ConvertFrom-Json
            $messageCount = if ($messages -is [array]) { $messages.Length } else { 1 }
            Write-ColorOutput "留言資料: $messageCount 則留言" "Info"
            
            if ($messageCount -gt 1000) {
                Write-ColorOutput "Too many messages (${messageCount}), recommend periodic cleanup" "Warning"
            }
        }
        catch {
            Write-ColorOutput "無法讀取留言資料" "Warning"
        }
    }
}

# 檢查檔案完整性
function Test-FileIntegrity {
    Write-ColorOutput "檢查檔案完整性..." "Info"
    
    $requiredFiles = @(
        "scan.html",
        "assets/css/scan.css",
        "config/scan_config.json",
        "data/books_list.json",
        "README.md"
    )
    
    $missingFiles = @()
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Length -eq 0) {
        Write-ColorOutput "所有必要檔案都存在" "Success"
    }
    else {
        Write-ColorOutput "缺少必要檔案:" "Error"
        foreach ($file in $missingFiles) {
            Write-Host "  - $file" -ForegroundColor Red
        }
    }
    
    # 檢查主檔案大小
    $mainHtml = "scan.html"
    if (Test-Path $mainHtml) {
        $size = (Get-Item $mainHtml).Length
        if ($size -lt 10000) {
            Write-ColorOutput "$mainHtml 檔案似乎過小 ($size bytes)" "Warning"
        }
        else {
            Write-ColorOutput "$mainHtml 檔案大小正常 ($size bytes)" "Success"
        }
    }
    
    return $missingFiles.Length -eq 0
}

# 生成專案統計報告
function New-StatsReport {
    Write-ColorOutput "生成專案統計報告..." "Info"
    
    $reportFile = "PROJECT_STATS.md"
    
    # 收集統計資訊
    $totalSize = (Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum
    $fileCount = (Get-ChildItem -Recurse -File | Measure-Object).Count
    $jsonFiles = (Get-ChildItem -Filter "*.json" -Recurse | Measure-Object).Count
    
    # 計算程式行數
    $jsHtmlLines = 0
    Get-ChildItem -Filter "*.js" -Recurse | ForEach-Object { $jsHtmlLines += (Get-Content $_.FullName | Measure-Object -Line).Lines }
    Get-ChildItem -Filter "*.html" -Recurse | ForEach-Object { $jsHtmlLines += (Get-Content $_.FullName | Measure-Object -Line).Lines }
    
    $cssLines = 0
    Get-ChildItem -Filter "*.css" -Recurse | ForEach-Object { $cssLines += (Get-Content $_.FullName | Measure-Object -Line).Lines }
    
    # 生成報告
    $report = @"
# 專案統計報告

生成時間: $(Get-Date)

## 檔案統計
- 總檔案數: $fileCount
- 專案大小: $([math]::Round($totalSize / 1MB, 2)) MB
- JavaScript/HTML 程式行數: $jsHtmlLines
- CSS 樣式行數: $cssLines
- JSON 配置檔案: $jsonFiles

## 目錄結構
``````
$(Get-ChildItem -Directory -Recurse | Sort-Object Name | Select-Object -First 20 | ForEach-Object { $_.FullName.Replace($PWD.Path, '.') })
``````

## 主要檔案大小
``````
$((Get-ChildItem -Filter "*.html", "*.css", "*.json" -Recurse | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object { "$([math]::Round($_.Length / 1KB, 1)) KB`t$($_.Name)" }) -join "`n")
``````

## 配置檔案狀態
"@

    # 檢查配置檔案
    if (Test-Path "config/scan_config.json") {
        $report += "`n- ✅ 掃描配置檔案存在"
    }
    else {
        $report += "`n- ❌ 掃描配置檔案缺失"
    }
    
    if (Test-Path "data/books_list.json") {
        try {
            $bookList = Get-Content "data/books_list.json" -Raw | ConvertFrom-Json
            $bookCount = if ($bookList -is [array]) { $bookList.Length } else { "未知" }
            $report += "`n- ✅ 書籍清單檔案存在 ($bookCount 本書)"
        }
        catch {
            $report += "`n- ⚠️ 書籍清單檔案存在但格式可能有問題"
        }
    }
    else {
        $report += "`n- ❌ 書籍清單檔案缺失"
    }
    
    Set-Content -Path $reportFile -Value $report -Encoding UTF8
    Write-ColorOutput "統計報告已生成: $reportFile" "Success"
}

# 驗證應用程式配置
function Test-AppConfig {
    Write-ColorOutput "驗證應用程式配置..." "Info"
    
    $configFile = "config/scan_config.json"
    
    if (-not (Test-Path $configFile)) {
        Write-ColorOutput "配置檔案不存在: $configFile" "Error"
        return $false
    }
    
    try {
        $config = Get-Content $configFile -Raw | ConvertFrom-Json
        
        # 檢查必要的配置項目
        $requiredKeys = @("roi", "processing", "detection", "camera", "ui")
        $missingKeys = @()
        
        foreach ($key in $requiredKeys) {
            if (-not ($config.PSObject.Properties.Name -contains $key)) {
                $missingKeys += $key
            }
        }
        
        if ($missingKeys.Length -eq 0) {
            Write-ColorOutput "應用程式配置驗證通過" "Success"
        }
        else {
            Write-ColorOutput "配置檔案缺少必要項目: $($missingKeys -join ', ')" "Error"
            return $false
        }
        
        # 檢查數值範圍
        if ($config.processing -and $config.processing.contrast) {
            $contrast = [double]$config.processing.contrast
            if ($contrast -lt 0.5 -or $contrast -gt 3.0) {
                Write-ColorOutput "對比度數值超出建議範圍 (0.5-3.0): $contrast" "Warning"
            }
        }
        
        if ($config.detection -and $config.detection.intervalMs) {
            $interval = [int]$config.detection.intervalMs
            if ($interval -lt 50 -or $interval -gt 1000) {
                Write-ColorOutput "檢測間隔超出建議範圍 (50-1000ms): ${interval}ms" "Warning"
            }
        }
        
        return $true
    }
    catch {
        Write-ColorOutput "配置檔案格式錯誤: $($_.Exception.Message)" "Error"
        return $false
    }
}

# 檢查安全性
function Test-Security {
    Write-ColorOutput "檢查安全性配置..." "Info"
    
    # 檢查敏感資訊
    $sensitivePatterns = @("password", "secret", "token", "api_key", "private_key")
    $foundIssues = 0
    
    foreach ($pattern in $sensitivePatterns) {
        $files = Get-ChildItem -File -Recurse | Where-Object { $_.Extension -notin @(".md", ".git") }
        foreach ($file in $files) {
            try {
                $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
                if ($content -match $pattern) {
                    Write-ColorOutput "發現可能的敏感資訊在 $($file.Name): $pattern" "Warning"
                    $foundIssues++
                }
            }
            catch {
                # 忽略無法讀取的檔案
            }
        }
    }
    
    if ($foundIssues -eq 0) {
        Write-ColorOutput "未發現明顯的安全問題" "Success"
    }
    else {
        Write-ColorOutput "發現 $foundIssues 個潛在安全問題，請檢查" "Warning"
    }
    
    return $foundIssues -eq 0
}

# 建立備份
function New-Backup {
    if ($SkipBackup) {
        Write-ColorOutput "跳過備份建立" "Info"
        return
    }
    
    Write-ColorOutput "建立專案備份..." "Info"
    
    $backupDir = "backups"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
    }
    
    $backupName = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
    $backupPath = Join-Path $backupDir $backupName
    
    try {
        # 壓縮專案檔案（排除特定目錄和檔案）
        $filesToBackup = Get-ChildItem -Recurse | Where-Object { 
            $_.FullName -notmatch '\\\.git\\' -and 
            $_.FullName -notmatch '\\node_modules\\' -and
            $_.FullName -notmatch '\\backups\\' -and
            $_.Extension -ne '.tmp'
        }
        
        Compress-Archive -Path $filesToBackup.FullName -DestinationPath $backupPath -Force
        
        $backupSize = [math]::Round((Get-Item $backupPath).Length / 1MB, 2)
        Write-ColorOutput "Backup completed: $backupPath (${backupSize} MB)" "Success"
        
        # 清理舊備份（保留最新 5 個）
        $oldBackups = Get-ChildItem -Path $backupDir -Filter "backup_*.zip" | Sort-Object CreationTime -Descending | Select-Object -Skip 5
        if ($oldBackups) {
            $oldBackups | Remove-Item -Force
            Write-ColorOutput "清理舊備份，保留最新 5 個" "Info"
        }
    }
    catch {
        Write-ColorOutput "備份失敗: $($_.Exception.Message)" "Error"
    }
}

# 執行快速檢查
function Invoke-QuickCheck {
    Write-ColorOutput "執行快速檢查..." "Info"
    
    $checks = @(
        { Test-Path "scan.html" },
        { Test-Path "config/scan_config.json" },
        { Test-Path "assets/css/scan.css" }
    )
    
    $passedChecks = 0
    foreach ($check in $checks) {
        if (& $check) {
            $passedChecks++
        }
    }
    
    if ($passedChecks -eq $checks.Length) {
        Write-ColorOutput "快速檢查通過 ($passedChecks/$($checks.Length))" "Success"
        return $true
    }
    else {
        Write-ColorOutput "快速檢查失敗 ($passedChecks/$($checks.Length))" "Error"
        return $false
    }
}

# 主要執行函數
function Invoke-Optimization {
    Write-ColorOutput "開始專案優化流程..." "Info"
    Write-Host ""
    
    $results = @{}
    
    try {
        # 基礎檢查
        Test-PowerShellVersion
        Test-RequiredModules
        Write-Host ""
        
        # 快速檢查模式
        if ($QuickCheck) {
            $results.QuickCheck = Invoke-QuickCheck
            Write-Host ""
            return $results
        }
        
        # 完整檢查流程
        $results.FileIntegrity = Test-FileIntegrity
        Write-Host ""
        
        $results.JsonValidation = Test-JsonFiles
        Write-Host ""
        
        $results.AppConfig = Test-AppConfig
        Write-Host ""
        
        Clear-TempFiles
        Write-Host ""
        
        Optimize-DataFiles
        Write-Host ""
        
        $results.Security = Test-Security
        Write-Host ""
        
        New-StatsReport
        Write-Host ""
        
        New-Backup
        Write-Host ""
        
        # 總結結果
        $successCount = ($results.Values | Where-Object { $_ -eq $true }).Count
        $totalCount = $results.Count
        
        Write-ColorOutput "專案優化完成！" "Success"
        Write-ColorOutput "檢查結果: $successCount/$totalCount 項通過" "Info"
        Write-Host ""
        
        Write-ColorOutput "建議執行以下命令測試應用程式:" "Info"
        Write-Host "  python -m http.server 8000" -ForegroundColor Cyan
        Write-Host "  然後在瀏覽器中訪問 http://localhost:8000" -ForegroundColor Cyan
        Write-Host ""
        
        # 顯示需要注意的問題
        $failedChecks = $results.GetEnumerator() | Where-Object { $_.Value -eq $false }
        if ($failedChecks) {
            Write-ColorOutput "需要注意的問題:" "Warning"
            foreach ($check in $failedChecks) {
                Write-Host "  - $($check.Key)" -ForegroundColor Yellow
            }
        }
        
        return $results
    }
    catch {
        Write-ColorOutput "優化過程中發生錯誤: $($_.Exception.Message)" "Error"
        return $false
    }
}

# 執行主函數
$optimizationResults = Invoke-Optimization

# 設定退出代碼
if ($optimizationResults -and ($optimizationResults.GetType().Name -eq "Hashtable")) {
    $failedCount = ($optimizationResults.Values | Where-Object { $_ -eq $false }).Count
    if ($failedCount -eq 0) {
        exit 0  # 成功
    }
    else {
        exit 1  # 有問題需要處理
    }
}
else {
    exit 1  # 執行失敗
}