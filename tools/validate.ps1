# 專案快速驗證腳本
# Quick Project Validation Script

Write-Host "=== 布可星球條碼掃描器 - 專案驗證 ===" -ForegroundColor Magenta
Write-Host ""

# 檢查核心檔案
$coreFiles = @(
    "scan.html",
    "assets/css/scan.css", 
    "config/scan_config.json",
    "data/books_list.json"
)

Write-Host "檢查核心檔案..." -ForegroundColor Cyan
$allExists = $true

foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - 存在" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $file - 缺失" -ForegroundColor Red
        $allExists = $false
    }
}

Write-Host ""

# 檢查配置檔案格式
Write-Host "檢查配置檔案格式..." -ForegroundColor Cyan
try {
    $config = Get-Content "config/scan_config.json" -Raw | ConvertFrom-Json
    Write-Host "✅ 配置檔案格式正確" -ForegroundColor Green
    
    # 檢查必要配置項
    $requiredKeys = @("roi", "processing", "detection", "camera", "ui")
    $configValid = $true
    
    foreach ($key in $requiredKeys) {
        if ($config.PSObject.Properties.Name -contains $key) {
            Write-Host "  ✅ $key - 配置存在" -ForegroundColor Green
        }
        else {
            Write-Host "  ❌ $key - 配置缺失" -ForegroundColor Red
            $configValid = $false
        }
    }
}
catch {
    Write-Host "❌ 配置檔案格式錯誤" -ForegroundColor Red
    $configValid = $false
}

Write-Host ""

# 檢查檔案大小
Write-Host "檢查檔案大小..." -ForegroundColor Cyan
if (Test-Path "scan.html") {
    $size = (Get-Item "scan.html").Length
    if ($size -gt 10000) {
        Write-Host "✅ scan.html 大小正常 ($size bytes)" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ scan.html 檔案過小 ($size bytes)" -ForegroundColor Yellow
    }
}

Write-Host ""

# 總結
Write-Host "=== 驗證結果 ===" -ForegroundColor Magenta
if ($allExists -and $configValid) {
    Write-Host "🎉 專案驗證通過！所有核心檔案和配置都正常。" -ForegroundColor Green
    Write-Host ""
    Write-Host "建議的測試步驟:" -ForegroundColor Cyan
    Write-Host "1. python -m http.server 8000" -ForegroundColor White
    Write-Host "2. 開啟瀏覽器訪問 http://localhost:8000" -ForegroundColor White
    Write-Host "3. 測試雙按鈕手電筒功能" -ForegroundColor White
    Write-Host "4. 測試條碼掃描功能" -ForegroundColor White
    exit 0
}
else {
    Write-Host "⚠️ 專案驗證發現問題，請檢查上述錯誤。" -ForegroundColor Yellow
    exit 1
}