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

# Google Sheets API 設定
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name('myapikey.json', scope)
client = gspread.authorize(creds)
sheet = client.open_by_url('https://docs.google.com/spreadsheets/d/1BhstIJ_z6S0Yzxbn4kTUnF5miTdZAhQebiG-F_vztDQ/edit?usp=sharing').sheet1

def setup_driver():
    """設置Chrome瀏覽器"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 無頭模式
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
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
    
    # 設置頁面載入超時
    chrome_options.add_argument('--page-load-strategy=eager')
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # 設置超時時間
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        
        return driver
    except Exception as e:
        print(f"Chrome driver setup failed: {e}")
        return None

def fetch_books_selenium(lang_code, total_pages):
    """使用Selenium獲取書籍資料"""
    books = []
    driver = setup_driver()
    
    if not driver:
        print("無法初始化Chrome driver")
        return books
    
    try:
        for page in range(1, total_pages + 1):
            url = f'https://read.tn.edu.tw/Book/BookListTable?BookType=6&PlanetLanguage={lang_code}&BookSort=1&page={page}'
            print(f'正在抓取第 {page} 頁資料 (語言代碼: {lang_code})...')
            
            driver.get(url)
            
            # 等待表格載入
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "table tbody tr"))
                )
                
                # 等待JavaScript執行完成
                time.sleep(2)
                
                # 獲取所有表格行
                rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
                page_books = 0
                
                for row in rows:
                    tds = row.find_elements(By.TAG_NAME, "td")
                    if len(tds) >= 4:
                        name = tds[0].text.strip()
                        isbn = tds[3].text.strip()
                        
                        # 跳過模板變數或空值
                        if name and isbn and '{{' not in name and '{{' not in isbn:
                            books.append({'name': name, 'isbn': isbn})
                            page_books += 1
                
                print(f'第 {page} 頁找到 {page_books} 本書')
                
            except Exception as e:
                print(f'第 {page} 頁載入失敗: {e}')
                continue
                
    finally:
        driver.quit()
    
    return books

def update_sheet(sheet, all_books):
    """更新Google Sheets"""
    all_records = sheet.get_all_records()
    # Google Sheet 欄位名稱：「書名」及「ISBN」
    isbn_col = sheet.find('ISBN').col
    updated_count = 0
    
    for i, record in enumerate(all_records):
        book_name = record['書名']
        old_isbn = str(record['ISBN']).strip()
        match = next((b for b in all_books if b['name'] == book_name), None)
        if match and match['isbn'] != old_isbn:
            print(f'修正: {book_name} 原ISBN:{old_isbn} → 新ISBN:{match["isbn"]}')
            sheet.update_cell(i+2, isbn_col, match['isbn'])
            updated_count += 1
    
    print(f'總共修正了 {updated_count} 本書的ISBN')

if __name__ == "__main__":
    print("開始執行布可星球ISBN更新程式（Selenium版本）...")
    
    print("開始抓取中文書籍資料...")
    zh_books = fetch_books_selenium(lang_code='1', total_pages=2)  # 先測試2頁
    print(f"中文書籍抓取完成，共 {len(zh_books)} 本")
    
    if len(zh_books) > 0:
        print("測試成功，繼續抓取所有頁面...")
        zh_books = fetch_books_selenium(lang_code='1', total_pages=242)
        
        print("開始抓取英文書籍資料...")
        en_books = fetch_books_selenium(lang_code='2', total_pages=11)
        print(f"英文書籍抓取完成，共 {len(en_books)} 本")
        
        all_books = zh_books + en_books
        print(f"總共抓取到 {len(all_books)} 本書籍")
        
        print("開始更新Google Sheets...")
        update_sheet(sheet, all_books)
        print("全部布可ISBN已核對並修正完畢。")
    else:
        print("測試失敗，請檢查網站或程式設定")