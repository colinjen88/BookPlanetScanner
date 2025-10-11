/**
 * 布可星球條碼掃描器 - 資料管理模組
 * 負責統計數據、本地儲存、持久化等功能
 */

// === 資料管理類別 ===
class DataManager {
    constructor() {
        this.stats = {
            totalScans: 0,      // 總掃描次數
            totalVisits: 0,     // 累積訪問次數
            totalMessages: 0,   // 留言數量
            successScans: 0,    // 成功掃描次數
            sessionStats: {     // 當前會話統計
                frames: 0,
                valid: 0,
                success: 0
            }
        };

        this.storageKeys = {
            stats: 'bookPlanetStats',
            messages: 'bookPlanetMessages',
            userProfile: 'bookPlanetUserProfile',
            visits: 'bookPlanetVisits'
        };
    }

    // === 初始化 ===
    init() {
        this.loadStats();
        this.incrementVisitCount();
        this.updateStatsDisplay();
        this.bindEvents();
        return this;
    }

    // === 統計資料管理 ===
    loadStats() {
        try {
            const savedStats = localStorage.getItem(this.storageKeys.stats);
            if (savedStats) {
                const parsed = JSON.parse(savedStats);
                this.stats = { ...this.stats, ...parsed };
            }

            // 載入訪問次數
            const visits = localStorage.getItem(this.storageKeys.visits);
            if (visits) {
                this.stats.totalVisits = parseInt(visits) || 0;
            }

            // 載入留言數量
            const messages = localStorage.getItem(this.storageKeys.messages);
            if (messages) {
                const messageList = JSON.parse(messages);
                this.stats.totalMessages = messageList.length;
            }

        } catch (error) {
            console.error('載入統計資料失敗:', error);
            this.stats = {
                totalScans: 0,
                totalVisits: 0,
                totalMessages: 0,
                successScans: 0,
                sessionStats: { frames: 0, valid: 0, success: 0 }
            };
        }
    }

    saveStats() {
        try {
            // 儲存統計資料
            localStorage.setItem(this.storageKeys.stats, JSON.stringify({
                totalScans: this.stats.totalScans,
                successScans: this.stats.successScans,
                sessionStats: this.stats.sessionStats
            }));

            // 儲存訪問次數
            localStorage.setItem(this.storageKeys.visits, this.stats.totalVisits.toString());

            // 同時嘗試儲存到檔案系統
            this.saveStatsToFile();

        } catch (error) {
            console.error('儲存統計資料失敗:', error);
        }
    }

    async saveStatsToFile() {
        try {
            const statsData = {
                totalScans: this.stats.totalScans,
                totalVisits: this.stats.totalVisits,
                totalMessages: this.stats.totalMessages,
                successScans: this.stats.successScans,
                lastUpdated: new Date().toISOString(),
                sessionStats: this.stats.sessionStats
            };

            // 嘗試儲存到 data/stats.json
            await fetch('/api/save-stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(statsData)
            });

        } catch (error) {
            // 如果無法儲存到檔案，使用 localStorage 作為備援
            console.log('統計檔案儲存失敗，使用 localStorage:', error.message);
        }
    }

    // === 訪問次數管理 ===
    incrementVisitCount() {
        this.stats.totalVisits++;
        this.saveStats();
    }

    // === 掃描統計管理 ===
    updateStats(sessionStats) {
        this.stats.sessionStats = { ...sessionStats };
        this.updateStatsDisplay();
    }

    incrementScanCount() {
        this.stats.totalScans++;
        this.saveStats();
    }

    incrementSuccessCount() {
        this.stats.successScans++;
        this.incrementScanCount();
        this.saveStats();
    }

    // === 留言數量管理 ===
    updateMessageCount() {
        try {
            const messages = localStorage.getItem(this.storageKeys.messages);
            if (messages) {
                const messageList = JSON.parse(messages);
                this.stats.totalMessages = messageList.length;
                this.saveStats();
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('更新留言數量失敗:', error);
        }
    }

    // === 統計顯示更新 ===
    updateStatsDisplay() {
        this.updateFooterStats();
        this.updateStatusBoard();
    }

    updateFooterStats() {
        // 更新頁腳統計顯示
        const scanCountElement = document.getElementById('scanCount');
        const visitCountElement = document.getElementById('visitCount');
        const messageCountElement = document.getElementById('messageCount');

        if (scanCountElement) {
            scanCountElement.textContent = this.formatNumber(this.stats.totalScans);
        }

        if (visitCountElement) {
            visitCountElement.textContent = this.formatNumber(this.stats.totalVisits);
        }

        if (messageCountElement) {
            messageCountElement.textContent = this.formatNumber(this.stats.totalMessages);
        }
    }

    updateStatusBoard() {
        // 更新狀態面板
        const statusBoard = document.getElementById('statusBoard');
        if (!statusBoard) return;

        const { frames, valid, success } = this.stats.sessionStats;
        const successRate = valid > 0 ? ((success / valid) * 100).toFixed(1) : '0.0';
        const validRate = frames > 0 ? ((valid / frames) * 100).toFixed(1) : '0.0';

        statusBoard.innerHTML = `
            <div>已掃描幀數: <span>${this.formatNumber(frames)}</span></div>
            <div>有效條碼: <span>${this.formatNumber(valid)}</span> (${validRate}%)</div>
            <div>成功匹配: <span>${this.formatNumber(success)}</span> (${successRate}%)</div>
            <div>總掃描次數: <span>${this.formatNumber(this.stats.totalScans)}</span></div>
        `;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // === 資料匯出功能 ===
    exportData() {
        try {
            const exportData = {
                stats: this.stats,
                messages: JSON.parse(localStorage.getItem(this.storageKeys.messages) || '[]'),
                userProfile: JSON.parse(localStorage.getItem(this.storageKeys.userProfile) || 'null'),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `book-planet-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showNotification('資料匯出成功！', 'success');

        } catch (error) {
            console.error('資料匯出失敗:', error);
            this.showNotification('資料匯出失敗', 'error');
        }
    }

    // === 資料匯入功能 ===
    importData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // 驗證資料格式
                if (!importData.version || !importData.stats) {
                    throw new Error('無效的資料格式');
                }

                // 確認是否要覆蓋現有資料
                if (confirm('確定要匯入資料嗎？這將覆蓋現有的統計資料和留言。')) {
                    // 匯入統計資料
                    this.stats = { ...this.stats, ...importData.stats };
                    
                    // 匯入留言資料
                    if (importData.messages) {
                        localStorage.setItem(this.storageKeys.messages, JSON.stringify(importData.messages));
                    }

                    // 匯入使用者資料
                    if (importData.userProfile) {
                        localStorage.setItem(this.storageKeys.userProfile, JSON.stringify(importData.userProfile));
                    }

                    this.saveStats();
                    this.updateStatsDisplay();
                    
                    // 重新載入留言（如果留言系統存在）
                    if (window.feedbackSystem) {
                        window.feedbackSystem.loadMessages();
                        window.feedbackSystem.updateMessageCount();
                    }

                    this.showNotification('資料匯入成功！', 'success');
                }

            } catch (error) {
                console.error('資料匯入失敗:', error);
                this.showNotification('資料匯入失敗：' + error.message, 'error');
            }
        };

        reader.readAsText(file);
    }

    // === 資料重置功能 ===
    resetAllData() {
        if (confirm('確定要重置所有資料嗎？這將清除統計資料、留言和使用者資料，且無法復原。')) {
            if (confirm('這是最後確認，請再次確認要清除所有資料？')) {
                try {
                    // 清除所有 localStorage 資料
                    Object.values(this.storageKeys).forEach(key => {
                        localStorage.removeItem(key);
                    });

                    // 重置統計資料
                    this.stats = {
                        totalScans: 0,
                        totalVisits: 1, // 保留當前訪問
                        totalMessages: 0,
                        successScans: 0,
                        sessionStats: { frames: 0, valid: 0, success: 0 }
                    };

                    this.saveStats();
                    this.updateStatsDisplay();

                    // 重新載入留言系統
                    if (window.feedbackSystem) {
                        window.feedbackSystem.loadMessages();
                    }

                    this.showNotification('所有資料已重置', 'success');

                } catch (error) {
                    console.error('資料重置失敗:', error);
                    this.showNotification('資料重置失敗', 'error');
                }
            }
        }
    }

    // === 通知系統 ===
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInFromRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        // 添加動畫樣式
        if (!document.getElementById('notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes slideInFromRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideOutToRight {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 5秒後自動移除
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);

        // 點擊移除
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutToRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    // === 資料備份與恢復 ===
    async backupToCloud() {
        try {
            const backupData = {
                stats: this.stats,
                messages: JSON.parse(localStorage.getItem(this.storageKeys.messages) || '[]'),
                userProfile: JSON.parse(localStorage.getItem(this.storageKeys.userProfile) || 'null'),
                backupDate: new Date().toISOString()
            };

            // 這裡可以實作雲端備份邏輯
            console.log('備份資料:', backupData);
            this.showNotification('資料備份功能開發中', 'info');

        } catch (error) {
            console.error('雲端備份失敗:', error);
            this.showNotification('雲端備份失敗', 'error');
        }
    }

    // === 事件綁定 ===
    bindEvents() {
        // 監聽留言系統事件
        document.addEventListener('messageSubmitted', () => {
            this.updateMessageCount();
        });

        // 監聽掃描成功事件
        document.addEventListener('scanSuccess', () => {
            this.incrementSuccessCount();
        });

        // 頁面離開時儲存資料
        window.addEventListener('beforeunload', () => {
            this.saveStats();
        });

        // 定期儲存資料（每30秒）
        setInterval(() => {
            this.saveStats();
        }, 30000);
    }

    // === 效能監控 ===
    getPerformanceMetrics() {
        return {
            localStorage: {
                used: JSON.stringify(this.getAllStorageData()).length,
                limit: 5 * 1024 * 1024, // 5MB 一般限制
                usage: (JSON.stringify(this.getAllStorageData()).length / (5 * 1024 * 1024) * 100).toFixed(2) + '%'
            },
            stats: this.stats,
            timestamp: new Date().toISOString()
        };
    }

    getAllStorageData() {
        const data = {};
        Object.values(this.storageKeys).forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                data[key] = value;
            }
        });
        return data;
    }

    // === 除錯工具 ===
    debugInfo() {
        return {
            stats: this.stats,
            storage: this.getAllStorageData(),
            performance: this.getPerformanceMetrics(),
            version: '1.0.0'
        };
    }
}

// === 全域函數（向下相容） ===
window.exportData = function() {
    if (window.dataManager) {
        window.dataManager.exportData();
    }
};

window.resetAllData = function() {
    if (window.dataManager) {
        window.dataManager.resetAllData();
    }
};

// === 全域暴露 ===
window.DataManager = DataManager;