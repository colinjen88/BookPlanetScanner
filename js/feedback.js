/**
 * 布可星球條碼掃描器 - 留言系統模組
 * 負責使用者留言、回覆、頭像系統等功能
 */

// === 留言系統類別 ===
class FeedbackSystem {
    constructor() {
        // 名字分配系統
        this.nickNames = [
            '吉伊卡蛙', '哆啦J夢', '孫陸空', '炭治狼', '肝鐵人', '籠貓', '鎖龍',
            '奇芽', '謎豆子', '阿妮亞', '滷夫', '撕紙王', '辣布布', '史努嗶',
            '卡皮爸拉', '史笛奇', '鼻卡丘'
        ];

        // 頭像系統 (使用顏色+字母) - 深色版本
        this.avatarColors = [
            '#E53E3E', '#319795', '#3182CE', '#DD6B20', '#38A169',
            '#D69E2E', '#9F7AEA', '#3182CE', '#ED8936', '#48BB78',
            '#E53E3E', '#3182CE', '#D69E2E', '#4299E1', '#38A169',
            '#E53E3E', '#9F7AEA', '#319795', '#D69E2E', '#4299E1'
        ];

        this.isVisible = false;
    }

    // === 初始化 ===
    init() {
        this.bindEvents();
        this.loadMessages();
        return this;
    }

    // === 頭像生成系統 ===
    generateAvatar(name) {
        if (!name || name.length === 0) {
            return { char: '?', color: '#6B7280' };
        }
        const firstChar = name.charAt(0).toUpperCase();
        const colorIndex = (name.charCodeAt(0) + name.length) % this.avatarColors.length;
        const color = this.avatarColors[colorIndex];
        return { char: firstChar, color: color };
    }

    // 簡單的頭像HTML生成函數
    createAvatarHTML(avatarData) {
        if (!avatarData || !avatarData.char || !avatarData.color) {
            return '<div class="user-avatar" style="background-color: #6B7280;">?</div>';
        }
        return `<div class="user-avatar" style="background-color: ${avatarData.color}">${avatarData.char}</div>`;
    }

    // === 使用者資料生成 ===
    generateUserProfile() {
        // 檢查是否已經有分配過的使用者資料
        let userProfile = localStorage.getItem('bookPlanetUserProfile');
        if (userProfile) {
            try {
                return JSON.parse(userProfile);
            } catch (error) {
                console.log('解析使用者資料失敗，重新生成');
            }
        }

        // 生成新的使用者資料
        const randomName = this.nickNames[Math.floor(Math.random() * this.nickNames.length)];
        let randomNumber;
        do {
            randomNumber = Math.floor(Math.random() * 90) + 10; // 10-99
        } while (randomNumber.toString().includes('4')); // 排除包含4的數字

        const nickname = randomName + randomNumber.toString().padStart(2, '0');
        const avatarData = this.generateAvatar(nickname);

        const profile = {
            nickname: nickname,
            avatar: avatarData,
            createdAt: Date.now()
        };

        // 儲存到 localStorage
        localStorage.setItem('bookPlanetUserProfile', JSON.stringify(profile));
        return profile;
    }

    // === 留言相關功能 ===
    async submitMessage() {
        const nameInput = document.getElementById('feedbackName');
        const messageInput = document.getElementById('feedbackMessage');

        if (!nameInput || !messageInput) return;

        const username = nameInput.value.trim();
        const messageText = messageInput.value.trim();

        if (!messageText) {
            alert('請輸入留言內容');
            return;
        }

        try {
            const userProfile = this.generateUserProfile();
            const finalUsername = username || userProfile.nickname;
            const avatarData = this.generateAvatar(finalUsername);

            const message = {
                id: Date.now(),
                name: finalUsername,
                avatar: avatarData,
                content: messageText,
                timestamp: new Date().toLocaleString('zh-TW'),
                replies: []
            };

            // 儲存留言到 localStorage
            let messages = JSON.parse(localStorage.getItem('bookPlanetMessages') || '[]');
            messages.push(message);
            localStorage.setItem('bookPlanetMessages', JSON.stringify(messages));

            // 同時嘗試儲存到檔案系統（如果可能）
            try {
                await this.saveToFile('data/messages.json', messages);
            } catch (error) {
                console.log('檔案儲存失敗，使用 localStorage:', error.message);
            }

            // 清空表單
            nameInput.value = '';
            messageInput.value = '';

            // 重新載入留言列表
            this.loadMessages();

            // 顯示成功訊息
            this.showFeedbackSuccess();

        } catch (error) {
            console.error('提交留言失敗:', error);
            alert('留言提交失敗，請稍後再試');
        }
    }

    async saveToFile(filename, data) {
        // 模擬檔案儲存（實際上會使用 localStorage 作為備援）
        const response = await fetch('/api/save-messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('伺服器儲存失敗');
        }
    }

    loadMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        // 使用 requestAnimationFrame 來優化 DOM 操作
        requestAnimationFrame(() => {
            try {
                const messages = JSON.parse(localStorage.getItem('bookPlanetMessages') || '[]');
                
                if (messages.length === 0) {
                    messagesContainer.innerHTML = `
                        <div class="empty-messages">
                            <p>還沒有任何留言，成為第一個留言的人吧！</p>
                        </div>
                    `;
                    return;
                }

                // 使用文件片段來優化 DOM 操作
                const fragment = document.createDocumentFragment();
                const wrapper = document.createElement('div');
                wrapper.className = 'messages-list';
                
                messages
                    .sort((a, b) => b.id - a.id) // 最新的在上面
                    .forEach(msg => {
                        const messageDiv = document.createElement('div');
                        messageDiv.innerHTML = this.renderMessage(msg);
                        wrapper.appendChild(messageDiv.firstChild);
                    });
                
                fragment.appendChild(wrapper);
                
                // 一次性更新 DOM
                messagesContainer.innerHTML = '';
                messagesContainer.appendChild(fragment);

            } catch (error) {
                console.error('載入留言失敗:', error);
                messagesContainer.innerHTML = `
                    <div class="error-messages">
                        <p>載入留言時發生錯誤</p>
                    </div>
                `;
            }
        });
    }

    renderMessage(msg, isReply = false) {
        const avatarData = this.generateAvatar(msg.name || 'Anonymous');
        const avatarHTML = this.createAvatarHTML(avatarData);
        
        const repliesHTML = (!isReply && msg.replies && msg.replies.length > 0) 
            ? msg.replies.map(reply => 
                `<div class="reply-message">${this.renderMessage(reply, true)}</div>`
              ).join('')
            : '';

        const replyButtonHTML = !isReply 
            ? `<div class="message-actions">
                 <button class="reply-btn" data-message-id="${msg.id}">回覆</button>
               </div>
               <div class="reply-form" id="replyForm${msg.id}" style="display: none;">
                 <div class="reply-input-group">
                   <input type="text" id="replyName${msg.id}" placeholder="你的名字（選填）">
                 </div>
                 <div class="reply-input-group">
                   <textarea id="replyContent${msg.id}" placeholder="寫下你的回覆..." rows="3"></textarea>
                 </div>
                 <div class="reply-actions">
                   <button class="reply-cancel-btn" data-message-id="${msg.id}">取消</button>
                   <button class="reply-submit-btn" data-message-id="${msg.id}">回覆</button>
                 </div>
               </div>`
            : '';

        return `
            <div class="message" data-id="${msg.id}">
                <div class="message-header">
                    <div class="user-info">
                        ${avatarHTML}
                        <span class="message-name">${msg.name || 'Anonymous'}</span>
                    </div>
                    <span class="message-time">${msg.timestamp}</span>
                </div>
                <p class="message-content">${msg.content}</p>
                ${replyButtonHTML}
                ${repliesHTML}
            </div>
        `;
    }

    // === 回覆功能 ===
    toggleReplyForm(messageId) {
        const replyForm = document.getElementById(`replyForm${messageId}`);
        if (replyForm) {
            const isCurrentlyVisible = replyForm.classList.contains('show');
            
            // 隱藏所有其他的回覆表單
            document.querySelectorAll('.reply-form.show').forEach(form => {
                form.classList.remove('show');
            });
            
            // 切換當前表單的顯示狀態
            if (!isCurrentlyVisible) {
                replyForm.classList.add('show');
                const textarea = document.getElementById(`replyContent${messageId}`);
                if (textarea) {
                    setTimeout(() => textarea.focus(), 100);
                }
            }
        }
    }

    async submitReply(messageId) {
        const nameInput = document.getElementById(`replyName${messageId}`);
        const contentInput = document.getElementById(`replyContent${messageId}`);

        if (!nameInput || !contentInput) return;

        const username = nameInput.value.trim();
        const content = contentInput.value.trim();

        if (!content) {
            alert('請輸入回覆內容');
            return;
        }

        try {
            const userProfile = this.generateUserProfile();
            const finalUsername = username || userProfile.nickname;
            const avatarData = this.generateAvatar(finalUsername);

            const reply = {
                id: Date.now(),
                name: finalUsername,
                avatar: avatarData,
                content: content,
                timestamp: new Date().toLocaleString('zh-TW')
            };

            // 更新留言資料
            let messages = JSON.parse(localStorage.getItem('bookPlanetMessages') || '[]');
            const messageIndex = messages.findIndex(msg => msg.id === messageId);
            
            if (messageIndex !== -1) {
                if (!messages[messageIndex].replies) {
                    messages[messageIndex].replies = [];
                }
                messages[messageIndex].replies.push(reply);
                localStorage.setItem('bookPlanetMessages', JSON.stringify(messages));

                // 同時嘗試儲存到檔案系統
                try {
                    await this.saveToFile('data/messages.json', messages);
                } catch (error) {
                    console.log('檔案儲存失敗，使用 localStorage:', error.message);
                }

                // 清空表單並隱藏
                nameInput.value = '';
                contentInput.value = '';
                this.toggleReplyForm(messageId);

                // 重新載入留言列表
                this.loadMessages();

                // 顯示成功訊息
                this.showFeedbackSuccess('回覆已發表！');
            }

        } catch (error) {
            console.error('提交回覆失敗:', error);
            alert('回覆提交失敗，請稍後再試');
        }
    }

    // === 成功提示 ===
    showFeedbackSuccess(message = '留言已發表！') {
        // 創建提示元素
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
        `;
        alertDiv.textContent = message;

        // 添加動畫樣式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(alertDiv);

        // 3秒後自動移除
        setTimeout(() => {
            alertDiv.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }

    // === 顯示/隱藏留言版 ===
    show() {
        const feedbackSection = document.getElementById('feedbackSection');
        if (feedbackSection) {
            feedbackSection.style.display = 'block';
            this.isVisible = true;
            this.loadMessages(); // 重新載入留言
            
            // 如果還沒有使用者資料，先生成一個並填入表單
            const userProfile = this.generateUserProfile();
            const nameInput = document.getElementById('feedbackName');
            if (nameInput && !nameInput.value) {
                nameInput.value = userProfile.nickname;
            }
        }
    }

    hide() {
        const feedbackSection = document.getElementById('feedbackSection');
        if (feedbackSection) {
            feedbackSection.style.display = 'none';
            this.isVisible = false;
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    // === 清除所有留言 ===
    clearAllMessages() {
        if (confirm('確定要清除所有留言嗎？此動作無法復原。')) {
            localStorage.removeItem('bookPlanetMessages');
            localStorage.removeItem('bookPlanetReplies');
            this.loadMessages();
            alert('所有留言已清除');
        }
    }

    // === 事件綁定 ===
    bindEvents() {
        // 提交留言表單
        const submitBtn = document.getElementById('submitFeedback');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitMessage());
        }

        // Enter 鍵提交（Ctrl+Enter 在 textarea 中）
        const messageInput = document.getElementById('feedbackMessage');
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    this.submitMessage();
                }
            });
        }

        // 關閉留言版按鈕
        const closeBtn = document.getElementById('closeFeedback');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // 使用事件委託優化留言區塊的點擊性能
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const messageId = e.target.dataset.messageId;
                if (!messageId) return;

                // 立即提供視覺反饋
                e.target.style.opacity = '0.7';
                setTimeout(() => {
                    e.target.style.opacity = '';
                }, 100);

                if (e.target.classList.contains('reply-btn')) {
                    this.toggleReplyForm(parseInt(messageId));
                } else if (e.target.classList.contains('reply-cancel-btn')) {
                    this.toggleReplyForm(parseInt(messageId));
                } else if (e.target.classList.contains('reply-submit-btn')) {
                    this.submitReply(parseInt(messageId));
                }
            });
        }

        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }
}

// === 全域函數（向下相容） ===
window.showFeedback = function() {
    if (window.feedbackSystem) {
        window.feedbackSystem.show();
    }
};

window.closeFeedback = function() {
    if (window.feedbackSystem) {
        window.feedbackSystem.hide();
    }
};

window.submitFeedback = function() {
    if (window.feedbackSystem) {
        window.feedbackSystem.submitMessage();
    }
};

window.clearAllMessages = function() {
    if (window.feedbackSystem) {
        window.feedbackSystem.clearAllMessages();
    }
};

// === 全域暴露 ===
window.FeedbackSystem = FeedbackSystem;