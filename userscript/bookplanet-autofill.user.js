// ==UserScript==
// @name         布可星球快速登入助手
// @name:en      BookPlanet Quick Login Helper
// @namespace    https://github.com/colinjen/BookPlanetScanner
// @version      1.1.0
// @description  自動填寫布可星球學生登入代碼，配合 PWA 實現一鍵登入！
// @description:en  Auto-fill student login code for BookPlanet Quiz system
// @author       Colin Jen
// @match        https://openid.tn.edu.tw/op/login.aspx*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tn.edu.tw
// @grant        none
// @license      MIT
// @supportURL   https://github.com/colinjen/BookPlanetScanner/issues
// @homepageURL  https://github.com/colinjen/BookPlanetScanner
// @run-at       document-end
// ==/UserScript==

/*
 * 布可星球快速登入助手
 * ========================
 * 
 * 這個腳本會自動偵測 URL 中的學生代碼 (例如 #50312)，
 * 然後自動選擇「學生登入」模式、填入代碼、並送出表單。
 * 
 * 使用方式：
 * 1. 安裝此腳本
 * 2. 使用「布可快速登入」PWA 設定您的年級班級座號
 * 3. 點擊「啟動登入」按鈕
 * 4. 腳本會自動完成登入流程！
 * 
 * 如有問題，請回報至：
 * https://github.com/colinjen/BookPlanetScanner/issues
 */

(function() {
    'use strict';
    
    const DEBUG = false; // 設為 true 可看到 console 訊息
    
    function log(msg) {
        if (DEBUG) console.log('[布可助手]', msg);
    }
    
    // 從 URL hash 讀取代碼 (例如 #50312)
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
        log('沒有偵測到代碼');
        return;
    }
    
    const code = hash.substring(1); // 去掉 #
    
    // 驗證代碼格式 (5位數字)
    if (!/^\d{5}$/.test(code)) {
        log('代碼格式不正確: ' + code);
        return;
    }
    
    log('偵測到代碼: ' + code);
    
    // 顯示處理中提示
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            z-index: 99999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        toast.textContent = message;
        
        // 動畫樣式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        // 3秒後移除
        setTimeout(() => toast.remove(), 3000);
    }
    
    // 主流程
    function autoFillAndSubmit() {
        showToast('🚀 正在自動登入...');
        
        // 1. 選擇「學生登入」模式
        const studentRadio = document.getElementById('ctl00_Main_login1_RadioButtonList1_1');
        if (studentRadio && !studentRadio.checked) {
            studentRadio.click();
            log('已選擇學生登入模式');
            // ASP.NET postback，等待頁面更新
            setTimeout(fillCodeAndSubmit, 1000);
        } else {
            fillCodeAndSubmit();
        }
    }
    
    let fillRetries = 0;
    const MAX_FILL_RETRIES = 10;

    function fillCodeAndSubmit() {
        const codeInput = document.getElementById('ctl00_Main_login1_txtStdClassSeat');
        if (!codeInput) {
            fillRetries++;
            if (fillRetries < MAX_FILL_RETRIES) {
                log('找不到代碼輸入框，重試 ' + fillRetries + '/' + MAX_FILL_RETRIES);
                setTimeout(fillCodeAndSubmit, 500);
            } else {
                log('超過重試上限，停止自動填入');
                showToast('找不到輸入框，請手動填入代碼：' + code);
            }
            return;
        }
        
        codeInput.value = code;
        codeInput.dispatchEvent(new Event('input', { bubbles: true }));
        codeInput.dispatchEvent(new Event('change', { bubbles: true }));
        log('已填入代碼');
        
        try {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {
            log('無法清除 hash: ' + e);
        }
        
        setTimeout(() => {
            const submitBtn =
                document.getElementById('ctl00_Main_login1_LoginButton') ||
                document.getElementById('ctl00_Main_login1_btnNext');
            if (submitBtn) {
                log('正在送出表單...');
                submitBtn.click();
            } else {
                log('找不到送出按鈕');
                showToast('已填入代碼，請手動點擊「下一步」');
            }
        }, 500);
    }
    
    // 開始執行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(autoFillAndSubmit, 300);
    } else {
        window.addEventListener('DOMContentLoaded', () => setTimeout(autoFillAndSubmit, 300));
    }
})();
