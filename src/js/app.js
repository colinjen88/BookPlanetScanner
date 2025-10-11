/**
 * 布可星球條碼掃描器 - 主應用程式
 * 整合所有模組並初始化應用程式
 */

// === 應用程式主類別 ===
class BookPlanetApp {
    constructor() {
        this.scanner = null;
        this.feedbackSystem = null;
        this.dataManager = null;
        this.uiUtils = null;
        this.elements = {};
        this.initialized = false;
    }

    // === 初始化應用程式 ===
    async init() {
        if (this.initialized) {
            console.log('應用程式已經初始化');
            return;
        }

        try {
            console.log('🚀 初始化布可星球條碼掃描器...');

            // 1. 初始化 DOM 元素
            this.initElements();

            // 2. 初始化各個模組
            await this.initModules();

            // 3. 綁定模組間的事件通信
            this.bindInterModuleCommunication();

            // 4. 初始化完成
            this.initialized = true;
            console.log('✅ 布可星球條碼掃描器初始化完成');

            // 5. 顯示歡迎訊息
            this.showWelcomeMessage();

        } catch (error) {
            console.error('❌ 應用程式初始化失敗:', error);
            this.showErrorMessage('應用程式初始化失敗：' + error.message);
        }
    }

    // === 初始化 DOM 元素 ===
    initElements() {
        this.elements = {
            // 主要控制按鈕
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            flashOffBtn: document.getElementById('flashOffBtn'),
            flashOnBtn: document.getElementById('flashOnBtn'),

            // 視訊相關
            preview: document.getElementById('preview'),
            roiOverlay: document.getElementById('roiOverlay'),

            // 狀態顯示
            engineBadge: document.getElementById('engineBadge'),
            cameraStatus: document.getElementById('cameraStatus'),
            engineStatus: document.getElementById('engineStatus'),
            resultCard: document.getElementById('resultCard'),
            statusBoard: document.getElementById('statusBoard'),

            // 彈窗
            successPopover: document.getElementById('successPopover'),

            // 統計相關
            scanCount: document.getElementById('scanCount'),
            visitCount: document.getElementById('visitCount'),
            messageCount: document.getElementById('messageCount'),

            // 留言系統
            feedbackSection: document.getElementById('feedbackSection'),
            feedbackName: document.getElementById('feedbackName'),
            feedbackMessage: document.getElementById('feedbackMessage'),
            messagesContainer: document.getElementById('messagesContainer'),
            submitFeedback: document.getElementById('submitFeedback'),
            closeFeedback: document.getElementById('closeFeedback')
        };

        // 檢查必要元素
        const requiredElements = ['startBtn', 'stopBtn', 'preview', 'resultCard'];
        const missingElements = requiredElements.filter(id => !this.elements[id]);
        
        if (missingElements.length > 0) {
            throw new Error(`缺少必要的 DOM 元素: ${missingElements.join(', ')}`);
        }

        console.log('✅ DOM 元素初始化完成');
    }

    // === 初始化各個模組 ===
    async initModules() {
        // 初始化 UI 工具
        this.uiUtils = new UIUtils();
        this.uiUtils.init(this.elements);
        window.uiUtils = this.uiUtils;
        console.log('✅ UI 工具模組初始化完成');

        // 初始化資料管理
        this.dataManager = new DataManager();
        this.dataManager.init();
        window.dataManager = this.dataManager;
        console.log('✅ 資料管理模組初始化完成');

        // 初始化留言系統
        this.feedbackSystem = new FeedbackSystem();
        this.feedbackSystem.init();
        window.feedbackSystem = this.feedbackSystem;
        console.log('✅ 留言系統模組初始化完成');

        // 初始化掃描器（最後初始化，因為需要其他模組支援）
        this.scanner = new BarcodeScanner();
        await this.scanner.init(this.elements);
        window.scanner = this.scanner;
        console.log('✅ 掃描器模組初始化完成');
    }

    // === 綁定模組間通信 ===
    bindInterModuleCommunication() {
        // 掃描成功時更新統計
        document.addEventListener('scanSuccess', () => {
            if (this.dataManager) {
                this.dataManager.incrementSuccessCount();
            }
        });

        // 留言提交時更新統計
        document.addEventListener('messageSubmitted', () => {
            if (this.dataManager) {
                this.dataManager.updateMessageCount();
            }
        });

        // 視窗大小改變時更新 ROI
        document.addEventListener('windowResize', () => {
            if (this.scanner) {
                this.scanner.updateRoiOverlay();
            }
        });

        // 頁面可見性改變時的處理
        document.addEventListener('visibilityChange', (e) => {
            if (!e.detail.visible && this.scanner && this.scanner.state.running) {
                console.log('頁面隱藏，暫停掃描以節省資源');
                // 可以選擇暫停掃描或保持運行
            }
        });

        console.log('✅ 模組間通信綁定完成');
    }

    // === 應用程式控制方法 ===
    async startScanning() {
        if (this.scanner) {
            await this.scanner.start();
        }
    }

    stopScanning(resetStats = true) {
        if (this.scanner) {
            this.scanner.stop(resetStats);
        }
    }

    toggleFlash() {
        if (this.scanner) {
            this.scanner.toggleFlash();
        }
    }

    // === 留言系統控制 ===
    showFeedback() {
        if (this.feedbackSystem) {
            this.feedbackSystem.show();
        }
    }

    hideFeedback() {
        if (this.feedbackSystem) {
            this.feedbackSystem.hide();
        }
    }

    // === 資料管理 ===
    exportData() {
        if (this.dataManager) {
            this.dataManager.exportData();
        }
    }

    async resetAllData() {
        if (this.dataManager && this.uiUtils) {
            const confirmed = await this.uiUtils.showConfirm(
                '確定要重置所有資料嗎？這將清除統計資料、留言和使用者資料，且無法復原。',
                '重置資料',
                '確定重置',
                '取消'
            );
            
            if (confirmed) {
                this.dataManager.resetAllData();
            }
        }
    }

    // === 歡迎訊息 ===
    showWelcomeMessage() {
        if (this.uiUtils) {
            // 檢查是否為首次訪問
            const isFirstVisit = !localStorage.getItem('bookPlanetVisited');
            
            if (isFirstVisit) {
                localStorage.setItem('bookPlanetVisited', 'true');
                setTimeout(() => {
                    this.uiUtils.showToast(
                        '歡迎使用布可星球條碼掃描器！點擊「開始掃描條碼」開始使用。',
                        'info',
                        5000
                    );
                }, 1000);
            } else {
                setTimeout(() => {
                    this.uiUtils.showToast('歡迎回來！', 'success', 2000);
                }, 500);
            }
        }
    }

    // === 錯誤處理 ===
    showErrorMessage(message) {
        if (this.uiUtils) {
            this.uiUtils.showToast(message, 'error', 5000);
        } else {
            alert(message);
        }
    }

    // === 除錯資訊 ===
    getDebugInfo() {
        return {
            initialized: this.initialized,
            modules: {
                scanner: !!this.scanner,
                feedbackSystem: !!this.feedbackSystem,
                dataManager: !!this.dataManager,
                uiUtils: !!this.uiUtils
            },
            elements: Object.keys(this.elements).reduce((acc, key) => {
                acc[key] = !!this.elements[key];
                return acc;
            }, {}),
            scannerState: this.scanner ? {
                running: this.scanner.state.running,
                stats: this.scanner.state.stats
            } : null,
            dataManagerStats: this.dataManager ? this.dataManager.stats : null
        };
    }

    // === 效能監控 ===
    getPerformanceInfo() {
        return {
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
            } : 'Not available',
            timing: performance.timing ? {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart + ' ms',
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart + ' ms'
            } : 'Not available',
            dataManager: this.dataManager ? this.dataManager.getPerformanceMetrics() : null
        };
    }
}

// === 全域應用程式實例 ===
let app = null;

// === 應用程式啟動函數 ===
async function initApp() {
    try {
        app = new BookPlanetApp();
        await app.init();
        
        // 暴露到全域供除錯使用
        window.app = app;
        
        return app;
    } catch (error) {
        console.error('應用程式啟動失敗:', error);
        throw error;
    }
}

// === 全域函數（向下相容） ===
window.startScanning = function() {
    if (app) app.startScanning();
};

window.stopScanning = function(resetStats = true) {
    if (app) app.stopScanning(resetStats);
};

window.toggleFlash = function() {
    if (app) app.toggleFlash();
};

window.showFeedback = function() {
    if (app) app.showFeedback();
};

window.closeFeedback = function() {
    if (app) app.hideFeedback();
};

window.exportData = function() {
    if (app) app.exportData();
};

window.resetAllData = function() {
    if (app) app.resetAllData();
};

// === 開發者工具 ===
window.getDebugInfo = function() {
    return app ? app.getDebugInfo() : null;
};

window.getPerformanceInfo = function() {
    return app ? app.getPerformanceInfo() : null;
};

// === 全域暴露 ===
window.BookPlanetApp = BookPlanetApp;
window.initApp = initApp;

// === 自動初始化（當 DOM 準備好時） ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM 已經準備好，立即初始化
    setTimeout(initApp, 0);
}