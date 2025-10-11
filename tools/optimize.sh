#!/bin/bash

# 布可星球條碼掃描器 - 專案清理與優化腳本
# Project Cleanup and Optimization Script

set -e

echo "🚀 布可星球條碼掃描器 - 專案優化開始"
echo "================================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查必要工具
check_dependencies() {
    log_info "檢查依賴工具..."
    
    local deps=("jq" "find" "wc" "du")
    local missing=()
    
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            missing+=($dep)
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "缺少必要工具: ${missing[*]}"
        log_info "請安裝缺少的工具後重新執行"
        exit 1
    fi
    
    log_success "所有依賴工具已就緒"
}

# 驗證 JSON 檔案格式
validate_json_files() {
    log_info "驗證 JSON 檔案格式..."
    
    local json_files=(
        "config/scan_config.json"
        "data/books_list.json"
        "data/messages.json"
        "data/stats.json"
    )
    
    local valid_count=0
    local total_count=${#json_files[@]}
    
    for file in "${json_files[@]}"; do
        if [ -f "$file" ]; then
            if jq empty "$file" &> /dev/null; then
                log_success "✓ $file 格式正確"
                ((valid_count++))
            else
                log_error "✗ $file 格式錯誤"
            fi
        else
            log_warning "⚠ $file 檔案不存在"
        fi
    done
    
    log_info "JSON 檔案驗證完成: $valid_count/$total_count 個檔案格式正確"
}

# 清理臨時和備份檔案
cleanup_temp_files() {
    log_info "清理臨時和備份檔案..."
    
    local cleanup_patterns=(
        "*.tmp"
        "*.bak"
        "*.backup"
        "*~"
        ".DS_Store"
        "Thumbs.db"
        "*.log"
        ".vscode/settings.json"
    )
    
    local deleted_count=0
    
    for pattern in "${patterns[@]}"; do
        while IFS= read -r -d '' file; do
            rm -f "$file"
            log_success "刪除: $file"
            ((deleted_count++))
        done < <(find . -name "$pattern" -type f -print0 2>/dev/null)
    done
    
    log_info "清理完成，共刪除 $deleted_count 個檔案"
}

# 優化資料檔案
optimize_data_files() {
    log_info "優化資料檔案..."
    
    # 壓縮 JSON 檔案（移除空白字元）
    local json_files=("config/scan_config.json" "data/books_list.json")
    
    for file in "${json_files[@]}"; do
        if [ -f "$file" ]; then
            local original_size=$(wc -c < "$file")
            jq -c . "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
            local new_size=$(wc -c < "$file")
            local saved=$((original_size - new_size))
            
            if [ $saved -gt 0 ]; then
                log_success "優化 $file: 節省 $saved bytes"
            fi
        fi
    done
    
    # 清理過期的留言資料（可選）
    if [ -f "data/messages.json" ]; then
        local message_count=$(jq length "data/messages.json" 2>/dev/null || echo "0")
        log_info "留言資料: $message_count 則留言"
        
        if [ "$message_count" -gt 1000 ]; then
            log_warning "留言資料較多 ($message_count 則)，建議定期清理"
        fi
    fi
}

# 檢查檔案完整性
check_file_integrity() {
    log_info "檢查檔案完整性..."
    
    # 必要檔案清單
    local required_files=(
        "scan.html"
        "assets/css/scan.css"
        "config/scan_config.json"
        "data/books_list.json"
        "README.md"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        log_success "所有必要檔案都存在"
    else
        log_error "缺少必要檔案:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
    fi
    
    # 檢查檔案大小
    local main_html="scan.html"
    if [ -f "$main_html" ]; then
        local size=$(wc -c < "$main_html")
        if [ $size -lt 10000 ]; then
            log_warning "$main_html 檔案似乎過小 ($size bytes)"
        else
            log_success "$main_html 檔案大小正常 ($size bytes)"
        fi
    fi
}

# 生成專案統計報告
generate_stats_report() {
    log_info "生成專案統計報告..."
    
    local report_file="PROJECT_STATS.md"
    local total_size=$(du -sh . | cut -f1)
    local file_count=$(find . -type f | wc -l)
    local js_lines=$(find . -name "*.js" -o -name "*.html" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
    local css_lines=$(find . -name "*.css" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
    local json_files=$(find . -name "*.json" | wc -l)
    
    cat > "$report_file" << EOF
# 專案統計報告

生成時間: $(date)

## 檔案統計
- 總檔案數: $file_count
- 專案大小: $total_size
- JavaScript/HTML 程式行數: $js_lines
- CSS 樣式行數: $css_lines
- JSON 配置檔案: $json_files

## 目錄結構
\`\`\`
$(find . -type d | head -20 | sort)
\`\`\`

## 主要檔案大小
\`\`\`
$(find . -name "*.html" -o -name "*.css" -o -name "*.json" | xargs ls -lh | awk '{print $5, $9}')
\`\`\`

## 配置檔案狀態
EOF

    # 檢查配置檔案
    if [ -f "config/scan_config.json" ]; then
        echo "- ✅ 掃描配置檔案存在" >> "$report_file"
    else
        echo "- ❌ 掃描配置檔案缺失" >> "$report_file"
    fi
    
    if [ -f "data/books_list.json" ]; then
        local book_count=$(jq length "data/books_list.json" 2>/dev/null || echo "未知")
        echo "- ✅ 書籍清單檔案存在 ($book_count 本書)" >> "$report_file"
    else
        echo "- ❌ 書籍清單檔案缺失" >> "$report_file"
    fi
    
    log_success "統計報告已生成: $report_file"
}

# 驗證應用程式配置
validate_app_config() {
    log_info "驗證應用程式配置..."
    
    local config_file="config/scan_config.json"
    
    if [ ! -f "$config_file" ]; then
        log_error "配置檔案不存在: $config_file"
        return 1
    fi
    
    # 檢查必要的配置項目
    local required_keys=("roi" "processing" "detection" "camera" "ui")
    local missing_keys=()
    
    for key in "${required_keys[@]}"; do
        if ! jq -e ".$key" "$config_file" > /dev/null 2>&1; then
            missing_keys+=("$key")
        fi
    done
    
    if [ ${#missing_keys[@]} -eq 0 ]; then
        log_success "應用程式配置驗證通過"
    else
        log_error "配置檔案缺少必要項目: ${missing_keys[*]}"
    fi
    
    # 檢查數值範圍
    local contrast=$(jq -r '.processing.contrast' "$config_file" 2>/dev/null)
    if [ "$contrast" != "null" ] && [ "$contrast" != "" ]; then
        if (( $(echo "$contrast < 0.5 || $contrast > 3.0" | bc -l) )); then
            log_warning "對比度數值超出建議範圍 (0.5-3.0): $contrast"
        fi
    fi
    
    local interval=$(jq -r '.detection.intervalMs' "$config_file" 2>/dev/null)
    if [ "$interval" != "null" ] && [ "$interval" != "" ]; then
        if [ "$interval" -lt 50 ] || [ "$interval" -gt 1000 ]; then
            log_warning "檢測間隔超出建議範圍 (50-1000ms): ${interval}ms"
        fi
    fi
}

# 檢查安全性
check_security() {
    log_info "檢查安全性配置..."
    
    # 檢查是否有敏感資訊洩露
    local sensitive_patterns=(
        "password"
        "secret"
        "token"
        "api_key"
        "private_key"
    )
    
    local found_issues=0
    
    for pattern in "${sensitive_patterns[@]}"; do
        if grep -r -i "$pattern" . --exclude-dir=.git --exclude="*.md" 2>/dev/null | grep -v "# 布可星球條碼掃描器" > /dev/null; then
            log_warning "發現可能的敏感資訊: $pattern"
            ((found_issues++))
        fi
    done
    
    if [ $found_issues -eq 0 ]; then
        log_success "未發現明顯的安全問題"
    else
        log_warning "發現 $found_issues 個潛在安全問題，請檢查"
    fi
    
    # 檢查檔案權限
    local executable_files=$(find . -type f -perm /111 | grep -v "\.sh$" | head -5)
    if [ -n "$executable_files" ]; then
        log_warning "發現可執行檔案，請確認是否合適:"
        echo "$executable_files"
    fi
}

# 建立備份
create_backup() {
    log_info "建立專案備份..."
    
    local backup_dir="backups"
    local backup_name="backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    mkdir -p "$backup_dir"
    
    tar -czf "$backup_dir/$backup_name" \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='backups' \
        --exclude='*.tmp' \
        . 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local backup_size=$(ls -lh "$backup_dir/$backup_name" | awk '{print $5}')
        log_success "備份完成: $backup_dir/$backup_name ($backup_size)"
    else
        log_error "備份失敗"
    fi
    
    # 清理舊備份（保留最新 5 個）
    local backup_count=$(ls -1 "$backup_dir"/backup_*.tar.gz 2>/dev/null | wc -l)
    if [ $backup_count -gt 5 ]; then
        ls -1t "$backup_dir"/backup_*.tar.gz | tail -n +6 | xargs rm -f
        log_info "清理舊備份，保留最新 5 個"
    fi
}

# 主要執行函數
main() {
    echo
    log_info "開始專案優化流程..."
    echo
    
    # 執行各項檢查和優化
    check_dependencies
    echo
    
    check_file_integrity
    echo
    
    validate_json_files
    echo
    
    validate_app_config
    echo
    
    cleanup_temp_files
    echo
    
    optimize_data_files
    echo
    
    check_security
    echo
    
    generate_stats_report
    echo
    
    create_backup
    echo
    
    log_success "專案優化完成！"
    echo
    log_info "建議執行以下命令測試應用程式:"
    echo "  python -m http.server 8000"
    echo "  然後在瀏覽器中訪問 http://localhost:8000"
    echo
}

# 執行主函數
main "$@"