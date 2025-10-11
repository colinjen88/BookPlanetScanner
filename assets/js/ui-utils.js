/**
 * 布可星球條碼掃描器 - UI 工具模組
 * 負責 UI 元素操作、動畫、彈窗、載入畫面等功能
 */

// === UI 工具類別 ===
class UIUtils {
    constructor() {
        this.popoverTimeout = null;
    }

    // === 初始化 ===
    init(elements) {
        this.elements = elements || {};
        this.bindGlobalEvents();
        return this;
    }

    // === 載入卡片功能 ===
    showLoadingCard() {
        if (!this.elements.resultCard) return;

        this.elements.resultCard.className = 'result-card loading';
        this.elements.resultCard.innerHTML = `
            <div class="loading-card">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                </div>
                <div class="loading-text">
                    正在處理掃描結果...
                </div>
            </div>
        `;
    }

    // === 結果卡片更新 ===
    updateResultCardForMatch(match) {
        if (!this.elements.resultCard) return;

        if (!match.found) {
            // 未找到匹配
            this.elements.resultCard.className = 'result-card error';
            this.elements.resultCard.innerHTML = `
                <div class="error-title">
                    <span class="error-icon">❌</span>
                    條碼掃描成功，但非布可星球選書
                </div>
                <div>
                    <strong>掃描到的條碼：</strong> ${match.matchedCode || match.original}<br>
                    此書籍不在布可星球選書清單中。<br>
                    請確認是否為正確的書籍，或聯繫管理員更新書單。
                </div>
            `;
        } else {
            // 找到匹配
            this.elements.resultCard.className = 'result-card success';
            this.elements.resultCard.innerHTML = `
                <div class="success-title">
                    <span class="success-icon">🎉</span>
                    恭喜！找到布可星球選書
                </div>
                <div>
                    <strong>書名：</strong> ${match.found.書名}<br>
                    <strong>ISBN：</strong> ${match.found.ISBN}<br>
                    ${match.found.適合對象 ? `<strong>適合對象：</strong> ${match.found.適合對象}<br>` : ''}
                    ${match.found.作者 ? `<strong>作者：</strong> ${match.found.作者}<br>` : ''}
                    ${match.found.出版社 ? `<strong>出版社：</strong> ${match.found.出版社}<br>` : ''}
                    ${match.found.分類 ? `<strong>分類：</strong> ${match.found.分類}<br>` : ''}
                </div>
            `;
        }
    }

    // === 成功彈窗 ===
    showSuccessPopover() {
        if (!this.elements.successPopover) return;

        // 清除之前的計時器
        if (this.popoverTimeout) {
            clearTimeout(this.popoverTimeout);
        }

        // 設定位置（視窗上方中央）
        const popover = this.elements.successPopover;
        popover.style.left = '50%';
        popover.style.top = '100px';
        popover.textContent = '🎉 掃描成功！找到布可星球選書！';

        // 顯示彈窗
        popover.classList.remove('fade-out');
        popover.classList.add('show');

        // 3秒後自動隱藏
        this.popoverTimeout = setTimeout(() => {
            this.hidePopover();
        }, 3000);

        // 觸發自訂事件
        document.dispatchEvent(new CustomEvent('scanSuccess'));
    }

    hidePopover() {
        if (!this.elements.successPopover) return;

        const popover = this.elements.successPopover;
        popover.classList.remove('show');
        popover.classList.add('fade-out');

        // 清除計時器
        if (this.popoverTimeout) {
            clearTimeout(this.popoverTimeout);
            this.popoverTimeout = null;
        }
    }

    // === 引擎狀態徽章更新 ===
    updateEngineBadge(text, success = false) {
        if (!this.elements.engineBadge) return;
        
        this.elements.engineBadge.textContent = text;
        this.elements.engineBadge.className = success ? 'hud-badge success' : 'hud-badge';
    }

    // === 按鈕狀態管理 ===
    updateButtonStates(isScanning) {
        if (this.elements.startBtn) {
            this.elements.startBtn.style.display = isScanning ? 'none' : 'inline-flex';
            this.elements.startBtn.disabled = isScanning;
        }

        if (this.elements.stopBtn) {
            this.elements.stopBtn.style.display = isScanning ? 'inline-flex' : 'none';
            this.elements.stopBtn.disabled = !isScanning;
        }

        if (this.elements.flashBtnHeader) {
            this.elements.flashBtnHeader.disabled = !isScanning;
        }
    }

    // === 手電筒圖示更新 ===
    updateFlashIcon(isOn) {
        if (this.elements.flashIconHeader) {
            this.elements.flashIconHeader.textContent = isOn ? '💡關閉' : '🔦手電筒';
        }
    }

    // === ROI 覆蓋層顯示/隱藏 ===
    showRoiOverlay() {
        if (this.elements.roiOverlay) {
            this.elements.roiOverlay.style.display = 'block';
        }
    }

    hideRoiOverlay() {
        if (this.elements.roiOverlay) {
            this.elements.roiOverlay.style.display = 'none';
        }
    }

    // === 動態提示系統 ===
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: toastSlideIn 0.3s ease-out;
            max-width: 80%;
            text-align: center;
            white-space: nowrap;
        `;
        toast.textContent = message;

        // 添加動畫樣式
        this.ensureToastStyles();

        document.body.appendChild(toast);

        // 自動移除
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);

        return toast;
    }

    getToastColor(type) {
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        return colors[type] || colors.info;
    }

    ensureToastStyles() {
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes toastSlideOut {
                    from { opacity: 1; transform: translateX(-50%) translateY(0); }
                    to { opacity: 0; transform: translateX(-50%) translateY(20px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // === 確認對話框 ===
    showConfirm(message, title = '確認', confirmText = '確定', cancelText = '取消') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                animation: modalFadeIn 0.2s ease-out;
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            `;

            dialog.innerHTML = `
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">
                    ${title}
                </div>
                <div style="color: #374151; margin-bottom: 24px; line-height: 1.5;">
                    ${message}
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancelBtn" style="
                        padding: 10px 20px;
                        border: 1px solid #d1d5db;
                        background: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                        color: #374151;
                    ">${cancelText}</button>
                    <button id="confirmBtn" style="
                        padding: 10px 20px;
                        border: none;
                        background: #3b82f6;
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 500;
                    ">${confirmText}</button>
                </div>
            `;

            this.ensureModalStyles();

            modal.appendChild(dialog);
            document.body.appendChild(modal);

            // 事件處理
            dialog.querySelector('#confirmBtn').onclick = () => {
                modal.style.animation = 'modalFadeOut 0.2s ease-out';
                setTimeout(() => {
                    document.body.removeChild(modal);
                    resolve(true);
                }, 200);
            };

            dialog.querySelector('#cancelBtn').onclick = () => {
                modal.style.animation = 'modalFadeOut 0.2s ease-out';
                setTimeout(() => {
                    document.body.removeChild(modal);
                    resolve(false);
                }, 200);
            };

            // 點擊背景關閉
            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.animation = 'modalFadeOut 0.2s ease-out';
                    setTimeout(() => {
                        document.body.removeChild(modal);
                        resolve(false);
                    }, 200);
                }
            };

            // ESC 鍵關閉
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.style.animation = 'modalFadeOut 0.2s ease-out';
                    setTimeout(() => {
                        document.body.removeChild(modal);
                        document.removeEventListener('keydown', escHandler);
                        resolve(false);
                    }, 200);
                }
            };
            document.addEventListener('keydown', escHandler);
        });
    }

    ensureModalStyles() {
        if (!document.getElementById('modalStyles')) {
            const style = document.createElement('style');
            style.id = 'modalStyles';
            style.textContent = `
                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes modalFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: scale(0.9) translateY(-20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // === 載入指示器 ===
    showLoadingOverlay(message = '載入中...') {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10002;
            animation: fadeIn 0.3s ease-out;
        `;

        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 32px;
                border-radius: 16px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            ">
                <div class="spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                "></div>
                <div style="color: #374151; font-weight: 500;">${message}</div>
            </div>
        `;

        document.body.appendChild(overlay);
        return overlay;
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }

    // === 狀態指示器 ===
    createStatusIndicator(container, status = 'idle') {
        const indicator = document.createElement('div');
        indicator.className = 'status-indicator';
        indicator.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            ${this.getStatusStyle(status)}
        `;

        indicator.innerHTML = `
            <div class="status-dot" style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: currentColor;
                animation: ${status === 'active' ? 'pulse 2s infinite' : 'none'};
            "></div>
            <span class="status-text">${this.getStatusText(status)}</span>
        `;

        if (container) {
            container.appendChild(indicator);
        }

        return indicator;
    }

    updateStatusIndicator(indicator, status) {
        if (!indicator) return;
        
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');
        
        // 更新樣式
        const styles = this.getStatusStyle(status);
        Object.entries(styles).forEach(([prop, value]) => {
            indicator.style[prop] = value;
        });

        // 更新動畫
        dot.style.animation = status === 'active' ? 'pulse 2s infinite' : 'none';
        
        // 更新文字
        text.textContent = this.getStatusText(status);
    }

    getStatusStyle(status) {
        const styles = {
            idle: { background: '#f3f4f6', color: '#6b7280' },
            active: { background: '#dbeafe', color: '#2563eb' },
            success: { background: '#d1fae5', color: '#059669' },
            error: { background: '#fee2e2', color: '#dc2626' },
            warning: { background: '#fef3c7', color: '#d97706' }
        };
        return styles[status] || styles.idle;
    }

    getStatusText(status) {
        const texts = {
            idle: '待命',
            active: '運行中',
            success: '成功',
            error: '錯誤',
            warning: '警告'
        };
        return texts[status] || '未知';
    }

    // === 動畫工具 ===
    animateElement(element, animation, duration = 300) {
        if (!element) return Promise.resolve();

        return new Promise((resolve) => {
            element.style.animation = `${animation} ${duration}ms ease-out`;
            
            const handleAnimationEnd = () => {
                element.removeEventListener('animationend', handleAnimationEnd);
                element.style.animation = '';
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
        });
    }

    // === 全域事件綁定 ===
    bindGlobalEvents() {
        // 視窗大小改變時的處理
        window.addEventListener('resize', this.debounce(() => {
            // 通知相關組件更新佈局
            document.dispatchEvent(new CustomEvent('windowResize'));
        }, 250));

        // 頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            document.dispatchEvent(new CustomEvent('visibilityChange', {
                detail: { visible: !document.hidden }
            }));
        });
    }

    // === 工具函數 ===
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // === 元素查找輔助 ===
    findElements(selectors) {
        const elements = {};
        Object.entries(selectors).forEach(([key, selector]) => {
            elements[key] = document.querySelector(selector);
        });
        return elements;
    }

    // === 樣式工具 ===
    addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    toggleClass(element, className) {
        if (element && className) {
            element.classList.toggle(className);
            return element.classList.contains(className);
        }
        return false;
    }
}

// === 全域函數（向下相容） ===
window.showToast = function(message, type, duration) {
    if (window.uiUtils) {
        return window.uiUtils.showToast(message, type, duration);
    }
};

window.showConfirm = function(message, title, confirmText, cancelText) {
    if (window.uiUtils) {
        return window.uiUtils.showConfirm(message, title, confirmText, cancelText);
    }
    return Promise.resolve(confirm(message));
};

// === 全域暴露 ===
window.UIUtils = UIUtils;