"""
爬蟲程序記憶體清理工具
用於清理可能殘留的 Chrome/ChromeDriver 程序
"""

import subprocess
import psutil
import time
import sys

def kill_processes_by_name(process_names):
    """根據程序名稱終止程序"""
    killed_processes = []
    
    for process_name in process_names:
        try:
            # 使用 taskkill 命令終止程序
            result = subprocess.run(
                ['taskkill', '/F', '/IM', process_name], 
                capture_output=True, 
                text=True,
                shell=True
            )
            
            if result.returncode == 0:
                killed_processes.append(process_name)
                print(f"✅ 已終止程序：{process_name}")
            else:
                if "not found" not in result.stderr.lower():
                    print(f"ℹ️  程序不存在或已終止：{process_name}")
                
        except Exception as e:
            print(f"❌ 終止 {process_name} 時發生錯誤：{e}")
    
    return killed_processes

def kill_processes_by_criteria():
    """根據特定條件終止程序"""
    killed_count = 0
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                # 檢查是否為爬蟲相關的 Chrome 程序
                if proc.info['name'] and 'chrome' in proc.info['name'].lower():
                    cmdline = proc.info['cmdline']
                    if cmdline:
                        cmdline_str = ' '.join(cmdline).lower()
                        # 如果命令列包含 headless 或 webdriver 相關參數
                        if any(keyword in cmdline_str for keyword in [
                            '--headless', '--no-sandbox', '--disable-dev-shm-usage',
                            'chromedriver', '--remote-debugging-port'
                        ]):
                            print(f"🎯 發現爬蟲相關程序 PID {proc.info['pid']}：{proc.info['name']}")
                            proc.terminate()
                            killed_count += 1
                            time.sleep(0.1)
                            
                # 檢查 ChromeDriver 程序
                if proc.info['name'] and 'chromedriver' in proc.info['name'].lower():
                    print(f"🎯 發現 ChromeDriver 程序 PID {proc.info['pid']}")
                    proc.terminate()
                    killed_count += 1
                    time.sleep(0.1)
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                # 程序可能已經終止或無法訪問
                continue
            except Exception as e:
                print(f"處理程序時發生錯誤：{e}")
                continue
                
    except Exception as e:
        print(f"掃描程序時發生錯誤：{e}")
    
    return killed_count

def check_memory_usage():
    """檢查系統記憶體使用狀況"""
    try:
        memory = psutil.virtual_memory()
        print(f"\n📊 系統記憶體狀況：")
        print(f"   總記憶體：{memory.total / 1024 / 1024 / 1024:.1f} GB")
        print(f"   已使用：{memory.used / 1024 / 1024 / 1024:.1f} GB ({memory.percent:.1f}%)")
        print(f"   可用記憶體：{memory.available / 1024 / 1024 / 1024:.1f} GB")
        
        if memory.percent > 85:
            print("⚠️  記憶體使用率較高，建議清理不必要的程序")
        elif memory.percent > 70:
            print("ℹ️  記憶體使用率中等")
        else:
            print("✅ 記憶體使用率正常")
            
    except Exception as e:
        print(f"檢查記憶體時發生錯誤：{e}")

def list_chrome_processes():
    """列出所有 Chrome 相關程序"""
    chrome_processes = []
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'memory_info', 'cmdline']):
            if proc.info['name'] and 'chrome' in proc.info['name'].lower():
                memory_mb = proc.info['memory_info'].rss / 1024 / 1024
                cmdline = proc.info['cmdline']
                is_headless = False
                
                if cmdline:
                    cmdline_str = ' '.join(cmdline)
                    is_headless = '--headless' in cmdline_str
                
                chrome_processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'memory_mb': memory_mb,
                    'is_headless': is_headless,
                    'cmdline': cmdline_str[:100] + '...' if cmdline and len(' '.join(cmdline)) > 100 else ' '.join(cmdline) if cmdline else ''
                })
                
    except Exception as e:
        print(f"列出 Chrome 程序時發生錯誤：{e}")
    
    return chrome_processes

def main():
    """主要清理函數"""
    print("🧹 爬蟲程序記憶體清理工具")
    print("=" * 60)
    
    # 檢查記憶體使用狀況
    check_memory_usage()
    
    print(f"\n🔍 正在掃描 Chrome 相關程序...")
    chrome_processes = list_chrome_processes()
    
    if chrome_processes:
        print(f"\n發現 {len(chrome_processes)} 個 Chrome 相關程序：")
        headless_count = 0
        
        for proc in chrome_processes:
            status = "🤖 爬蟲程序" if proc['is_headless'] else "🌐 一般瀏覽器"
            print(f"   PID {proc['pid']:>6} | {proc['memory_mb']:>6.1f}MB | {status} | {proc['name']}")
            if proc['is_headless']:
                headless_count += 1
        
        print(f"\n統計：一般瀏覽器程序 {len(chrome_processes) - headless_count} 個，爬蟲程序 {headless_count} 個")
        
        if headless_count > 0:
            print(f"\n⚠️  發現 {headless_count} 個可能的爬蟲殘留程序")
            
            response = input("\n是否要清理爬蟲相關的程序？(y/N): ").lower().strip()
            
            if response == 'y' or response == 'yes':
                print("\n🧹 開始清理爬蟲相關程序...")
                
                # 使用條件終止
                killed_count = kill_processes_by_criteria()
                
                # 也嘗試直接終止 chromedriver
                killed_drivers = kill_processes_by_name(['chromedriver.exe'])
                
                print(f"\n✅ 清理完成！")
                print(f"   終止了 {killed_count} 個爬蟲相關程序")
                print(f"   終止了 {len(killed_drivers)} 個 ChromeDriver 程序")
                
                # 等待程序完全終止
                time.sleep(2)
                
                # 再次檢查記憶體
                print("\n清理後的記憶體狀況：")
                check_memory_usage()
                
            else:
                print("❌ 取消清理操作")
        else:
            print("✅ 沒有發現爬蟲殘留程序")
    else:
        print("✅ 沒有發現 Chrome 相關程序")
    
    # 檢查 Python 程序
    print(f"\n🐍 檢查 Python 程序...")
    try:
        python_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'memory_info']):
            if proc.info['name'] and 'python' in proc.info['name'].lower():
                cmdline = proc.info['cmdline']
                if cmdline and any('isbn' in arg.lower() for arg in cmdline):
                    memory_mb = proc.info['memory_info'].rss / 1024 / 1024
                    python_processes.append({
                        'pid': proc.info['pid'],
                        'memory_mb': memory_mb,
                        'cmdline': ' '.join(cmdline)
                    })
        
        if python_processes:
            print(f"發現 {len(python_processes)} 個爬蟲相關的 Python 程序：")
            for proc in python_processes:
                print(f"   PID {proc['pid']:>6} | {proc['memory_mb']:>6.1f}MB | {proc['cmdline'][:80]}...")
        else:
            print("✅ 沒有發現爬蟲相關的 Python 程序")
            
    except Exception as e:
        print(f"檢查 Python 程序時發生錯誤：{e}")
    
    print(f"\n🎉 記憶體檢查完成！")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n❌ 用戶中斷操作")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 程序執行時發生錯誤：{e}")
        sys.exit(1)