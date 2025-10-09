@echo off
echo 🧹 爬蟲程序清理工具
echo ============================================================

echo.
echo 📊 正在檢查系統記憶體使用狀況...
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory /format:table

echo.
echo 🔍 正在檢查 Chrome 相關程序...
tasklist | findstr /i "chrome" > temp_chrome.txt
if %errorlevel% equ 0 (
    echo 發現以下 Chrome 程序：
    type temp_chrome.txt
    
    echo.
    set /p choice="是否要終止所有 Chrome 程序？這可能會關閉您的瀏覽器 (y/N): "
    if /i "%choice%"=="y" (
        echo 🧹 正在終止 Chrome 程序...
        taskkill /F /IM chrome.exe 2>nul
        if %errorlevel% equ 0 (
            echo ✅ Chrome 程序已終止
        ) else (
            echo ℹ️  沒有 Chrome 程序需要終止
        )
    ) else (
        echo ❌ 跳過 Chrome 程序清理
    )
) else (
    echo ✅ 沒有發現 Chrome 程序
)

echo.
echo 🔍 正在檢查 ChromeDriver 程序...
tasklist | findstr /i "chromedriver" > temp_driver.txt
if %errorlevel% equ 0 (
    echo 發現以下 ChromeDriver 程序：
    type temp_driver.txt
    echo 🧹 正在終止 ChromeDriver 程序...
    taskkill /F /IM chromedriver.exe 2>nul
    if %errorlevel% equ 0 (
        echo ✅ ChromeDriver 程序已終止
    ) else (
        echo ℹ️  沒有 ChromeDriver 程序需要終止
    )
) else (
    echo ✅ 沒有發現 ChromeDriver 程序
)

echo.
echo 🐍 正在檢查 Python 爬蟲程序...
tasklist | findstr /i "python" > temp_python.txt
if %errorlevel% equ 0 (
    echo 發現以下 Python 程序：
    type temp_python.txt
    echo ℹ️  請手動檢查這些 Python 程序是否為爬蟲程序
) else (
    echo ✅ 沒有發現 Python 程序
)

echo.
echo 💾 正在執行垃圾清理...
del /f /q temp_*.txt 2>nul

echo.
echo 🎉 清理完成！
echo.
echo 💡 建議：
echo    1. 如果記憶體使用率仍然很高，請考慮重啟電腦
echo    2. 執行爬蟲前，建議先關閉不必要的程式
echo    3. 使用記憶體優化版本的爬蟲程式：isbn_memory_optimized.py
echo.
pause