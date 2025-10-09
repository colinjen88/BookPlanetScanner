from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import time
import json
import os
import gc
import psutil
from contextlib import contextmanager

# Google Sheets API 設定
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name('myapikey.json', scope)
client = gspread.authorize(creds)
sheet = client.open_by_url('https://docs.google.com/spreadsheets/d/1BhstIJ_z6S0Yzxbn4kTUnF5miTdZAhQebiG-F_vztDQ/edit?usp=sharing').sheet1

def get_memory_usage():
    """獲取當前記憶體使用狀況"""
    process = psutil.Process()
    memory_info = process.memory_info()
    return {
        'rss': memory_info.rss / 1024 / 1024,  # MB
        'vms': memory_info.vms / 1024 / 1024,  # MB
        'percent': process.memory_percent()
    }

def log_memory_usage(stage_name):
    """記錄記憶體使用狀況"""
    memory = get_memory_usage()
    print(f'📊 [{stage_name}] 記憶體使用: {memory["rss"]:.1f}MB (RSS), {memory["percent"]:.1f}%')

@contextmanager
def managed_driver():
    """使用 context manager 管理 driver 生命週期"""
    driver = None
    try:
        driver = setup_driver()
        if driver:
            log_memory_usage("WebDriver 啟動後")
            yield driver
        else:
            yield None
    finally:
        if driver:
            try:
                # 清理 driver 資源
                driver.delete_all_cookies()
                driver.execute_script("window.localStorage.clear();")
                driver.execute_script("window.sessionStorage.clear();")
                driver.quit()
                log_memory_usage("WebDriver 關閉後")
            except Exception as e:
                print(f"警告：清理 WebDriver 時發生錯誤: {e}")
            finally:
                driver = None
                # 強制垃圾回收
                gc.collect()
                log_memory_usage("垃圾回收後")

def setup_driver():
    """設置Chrome瀏覽器（記憶體優化版）"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    # 記憶體優化參數
    chrome_options.add_argument('--memory-pressure-off')
    chrome_options.add_argument('--max_old_space_size=4096')
    chrome_options.add_argument('--disable-background-timer-throttling')
    chrome_options.add_argument('--disable-backgrounding-occluded-windows')
    chrome_options.add_argument('--disable-renderer-backgrounding')
    chrome_options.add_argument('--disable-background-networking')
    chrome_options.add_argument('--disable-features=TranslateUI')
    chrome_options.add_argument('--disable-ipc-flooding-protection')
    
    # 原有優化參數
    chrome_options.add_argument('--ignore-ssl-errors')
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--allow-running-insecure-content')
    chrome_options.add_argument('--disable-web-security')
    chrome_options.add_argument('--disable-features=VizDisplayCompositor')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.160 Safari/537.36')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-plugins')
    chrome_options.add_argument('--disable-images')
    chrome_options.add_argument('--no-first-run')
    chrome_options.add_argument('--no-default-browser-check')
    chrome_options.add_argument('--disable-default-apps')
    chrome_options.add_argument('--page-load-strategy=eager')
    
    # 限制記憶體使用
    chrome_options.add_argument('--aggressive-cache-discard')
    chrome_options.add_argument('--memory-pressure-thresholds=critical:90')
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.set_page_load_timeout(20)
        driver.implicitly_wait(5)
        return driver
    except Exception as e:
        print(f"Chrome driver setup failed: {e}")
        return None

def save_progress(data, filename):
    """保存進度到文件（記憶體優化）"""
    try:
        # 確保目錄存在
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 清理記憶體中的大型變數
        del data
        gc.collect()
        
    except Exception as e:
        print(f"保存進度時發生錯誤: {e}")

def load_progress(filename):
    """從文件載入進度"""
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data
        except Exception as e:
            print(f"載入進度時發生錯誤: {e}")
            return []
    return []

def check_batch_completion(filename, expected_pages):
    """檢查批次是否已完成"""
    if not os.path.exists(filename):
        return False, 0
    
    books = load_progress(filename)
    expected_books = expected_pages * 8  # 降低預期，每頁約8本書
    actual_books = len(books)
    
    print(f"檢查 {filename}: {actual_books} 本書 (預期約 {expected_books} 本)")
    
    # 如果實際書籍數達到預期的70%以上，認為已完成（降低閾值）
    completion_rate = actual_books / expected_books if expected_books > 0 else 0
    is_complete = completion_rate >= 0.7
    
    return is_complete, actual_books

def fetch_books_batch(lang_code, start_page, end_page, progress_file, batch_name):
    """分批抓取書籍資料（記憶體優化版）"""
    print(f"\n{'='*60}")
    print(f"開始執行：{batch_name}")
    print(f"頁面範圍：第{start_page}-{end_page}頁")
    print(f"進度檔案：{progress_file}")
    
    log_memory_usage("批次開始前")
    
    # 檢查是否已完成
    is_complete, existing_count = check_batch_completion(progress_file, end_page - start_page + 1)
    
    if is_complete:
        print(f"✅ {batch_name} 已完成！載入現有的 {existing_count} 本書")
        books = load_progress(progress_file)
        log_memory_usage("載入現有資料後")
        return books
    
    print(f"🔄 {batch_name} 尚未完成，開始抓取...")
    
    books = load_progress(progress_file)  # 載入現有進度
    initial_count = len(books)
    print(f"已載入現有進度：{initial_count} 本書")
    
    with managed_driver() as driver:
        if not driver:
            print("❌ 無法初始化Chrome driver")
            return books
        
        try:
            for page in range(start_page, end_page + 1):
                url = f'https://read.tn.edu.tw/Book/BookListTable?BookType=6&PlanetLanguage={lang_code}&BookSort=1&page={page}'
                print(f'🔍 正在抓取第 {page} 頁資料 (語言代碼: {lang_code})...')
                
                retry_count = 0
                max_retries = 3
                
                while retry_count < max_retries:
                    try:
                        driver.get(url)
                        
                        # 等待表格載入
                        WebDriverWait(driver, 15).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
                        )
                        
                        time.sleep(2)  # 縮短等待時間
                        
                        # 獲取所有表格行
                        rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
                        page_books = 0
                        
                        for row in rows:
                            try:
                                tds = row.find_elements(By.TAG_NAME, "td")
                                if len(tds) >= 4:
                                    name = tds[0].text.strip()
                                    isbn = tds[3].text.strip()
                                    
                                    if name and isbn and '{{' not in name and '{{' not in isbn:
                                        # 檢查是否已存在（避免重複）
                                        if not any(book['name'] == name and book['isbn'] == isbn for book in books):
                                            books.append({'name': name, 'isbn': isbn})
                                            page_books += 1
                            except Exception as e:
                                print(f"處理行資料時發生錯誤: {e}")
                                continue
                        
                        print(f'   ✅ 第 {page} 頁找到 {page_books} 本新書')
                        
                        # 每3頁保存一次進度（增加保存頻率）
                        if page % 3 == 0:
                            save_progress(books, progress_file)
                            log_memory_usage(f"第 {page} 頁保存後")
                            print(f'   💾 已保存進度到第 {page} 頁，目前共 {len(books)} 本書')
                        
                        # 清理頁面資源
                        driver.execute_script("window.stop();")
                        
                        break  # 成功則跳出重試循環
                        
                    except Exception as e:
                        retry_count += 1
                        print(f'   ❌ 第 {page} 頁載入失敗 (嘗試 {retry_count}/{max_retries}): {e}')
                        if retry_count < max_retries:
                            print(f'   ⏳ 等待 {retry_count * 3} 秒後重試...')
                            time.sleep(retry_count * 3)  # 縮短重試等待時間
                        else:
                            print(f'   ⚠️ 第 {page} 頁最終失敗，跳過')
                
                # 每頁完成後強制垃圾回收
                if page % 5 == 0:
                    gc.collect()
                    log_memory_usage(f"第 {page} 頁垃圾回收後")
                            
        finally:
            save_progress(books, progress_file)
            final_count = len(books)
            new_books = final_count - initial_count
            print(f"\n✅ {batch_name} 執行完成！")
            print(f"   📊 原有書籍：{initial_count} 本")
            print(f"   📊 新增書籍：{new_books} 本")
            print(f"   📊 總計書籍：{final_count} 本")
            log_memory_usage("批次完成後")
    
    return books

def update_sheet(sheet, all_books):
    """更新Google Sheets（記憶體優化版）"""
    print(f"\n{'='*60}")
    print("開始更新Google Sheets...")
    log_memory_usage("Sheets更新開始前")
    
    try:
        all_records = sheet.get_all_records()
        isbn_col = sheet.find('ISBN').col
        updated_count = 0
        
        print(f'📋 比對 {len(all_books)} 本抓取的書籍和 {len(all_records)} 本Sheets中的書籍...')
        
        for i, record in enumerate(all_records):
            try:
                book_name = record['書名']
                old_isbn = str(record['ISBN']).strip()
                match = next((b for b in all_books if b['name'] == book_name), None)
                if match and match['isbn'] != old_isbn:
                    print(f'🔧 修正: {book_name}')
                    print(f'     原ISBN: {old_isbn}')
                    print(f'     新ISBN: {match["isbn"]}')
                    sheet.update_cell(i+2, isbn_col, match['isbn'])
                    updated_count += 1
                    time.sleep(1)  # 避免API限制
                
                # 每50筆記錄清理一次記憶體
                if i % 50 == 0 and i > 0:
                    gc.collect()
                    log_memory_usage(f"處理第 {i} 筆後")
                    
            except Exception as e:
                print(f"處理第 {i} 筆記錄時發生錯誤: {e}")
                continue
        
        print(f'\n✅ Google Sheets更新完成！總共修正了 {updated_count} 本書的ISBN')
        log_memory_usage("Sheets更新完成後")
        
    except Exception as e:
        print(f"更新Google Sheets時發生錯誤: {e}")

if __name__ == "__main__":
    print("🚀 開始執行布可星球ISBN更新程式（記憶體優化版本）...")
    print(f"執行時間：{time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    log_memory_usage("程式開始")
    
    # 定義批次資訊
    batches = [
        {
            'name': '第一批：中文書籍 第1-80頁',
            'lang_code': '1',
            'start_page': 1,
            'end_page': 80,
            'progress_file': '../進度檔案/zh_books_1_80.json'
        },
        {
            'name': '第二批：中文書籍 第81-160頁',
            'lang_code': '1',
            'start_page': 81,
            'end_page': 160,
            'progress_file': '../進度檔案/zh_books_81_160.json'
        },
        {
            'name': '第三批：中文書籍 第161-242頁',
            'lang_code': '1',
            'start_page': 161,
            'end_page': 242,
            'progress_file': '../進度檔案/zh_books_161_242.json'
        },
        {
            'name': '第四批：英文書籍 第1-11頁',
            'lang_code': '2',
            'start_page': 1,
            'end_page': 11,
            'progress_file': '../進度檔案/en_books.json'
        }
    ]
    
    all_books = []
    
    # 執行各批次
    for batch in batches:
        try:
            books = fetch_books_batch(
                lang_code=batch['lang_code'],
                start_page=batch['start_page'],
                end_page=batch['end_page'],
                progress_file=batch['progress_file'],
                batch_name=batch['name']
            )
            all_books.extend(books)
            
            # 每個批次完成後清理記憶體
            del books
            gc.collect()
            log_memory_usage(f"{batch['name']} 完成後")
            
        except Exception as e:
            print(f"執行 {batch['name']} 時發生錯誤: {e}")
            continue
    
    # 合併所有結果
    print(f"\n{'='*60}")
    print("📊 最終統計結果")
    print(f"   總共抓取書籍：{len(all_books)} 本")
    log_memory_usage("資料合併後")
    
    # 去重處理
    try:
        unique_books = []
        seen = set()
        for book in all_books:
            key = (book['name'], book['isbn'])
            if key not in seen:
                unique_books.append(book)
                seen.add(key)
        
        duplicate_count = len(all_books) - len(unique_books)
        if duplicate_count > 0:
            print(f"   去重後書籍：{len(unique_books)} 本 (移除 {duplicate_count} 本重複)")
            all_books = unique_books
        
        # 清理去重過程中的臨時變數
        del unique_books, seen
        gc.collect()
        log_memory_usage("去重完成後")
        
    except Exception as e:
        print(f"去重處理時發生錯誤: {e}")
    
    # 保存完整結果
    try:
        save_progress(all_books, '../進度檔案/all_books_complete.json')
        print(f"   已保存完整結果到 ../進度檔案/all_books_complete.json")
        log_memory_usage("保存完成後")
    except Exception as e:
        print(f"保存完整結果時發生錯誤: {e}")
    
    if len(all_books) > 0:
        try:
            update_sheet(sheet, all_books)
            print(f"\n🎉 全部完成！共處理 {len(all_books)} 本書籍")
        except Exception as e:
            print(f"更新Google Sheets時發生錯誤: {e}")
    else:
        print("\n❌ 沒有抓取到書籍資料")
    
    # 最終清理
    del all_books
    gc.collect()
    log_memory_usage("程式結束")
    
    print(f"結束時間：{time.strftime('%Y-%m-%d %H:%M:%S')}")