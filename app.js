const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
// 提供當前目錄的靜態文件服務
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'messages.json');

// 主頁面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'scan.html'));
});

// 取得留言列表
app.get('/messages', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.log('讀取留言檔案失敗，返回空陣列');
      return res.json([]);
    }
    try {
      const messages = JSON.parse(data);
      // 按時間倒序排列，最新的在前面
      messages.sort((a, b) => new Date(b.time) - new Date(a.time));
      res.json(messages);
    } catch (parseError) {
      console.log('解析留言資料失敗:', parseError);
      res.json([]);
    }
  });
});

// 新增留言
app.post('/messages', (req, res) => {
  const { name, content } = req.body;
  
  // 驗證輸入
  if (!name || !content) {
    return res.status(400).json({ error: '請填寫暱稱和留言內容' });
  }

  if (name.length > 50) {
    return res.status(400).json({ error: '暱稱不能超過 50 個字符' });
  }

  if (content.length > 500) {
    return res.status(400).json({ error: '留言內容不能超過 500 個字符' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    let messages = [];
    if (!err) {
      try {
        messages = JSON.parse(data);
      } catch (parseError) {
        console.log('解析留言檔案失敗:', parseError);
      }
    }

    // 創建新留言
    const newMessage = {
      name: name.trim(),
      content: content.trim(),
      time: new Date().toISOString(),
      id: Date.now() // 簡單的 ID 生成
    };

    messages.push(newMessage);

    fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('儲存留言失敗:', writeErr);
        return res.status(500).json({ error: '儲存失敗，請稍後再試' });
      }
      
      console.log(`新增留言成功: ${name} - ${content.substring(0, 20)}...`);
      res.json({ success: true, message: newMessage });
    });
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({ error: '伺服器內部錯誤' });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({ error: '找不到請求的資源' });
});

app.listen(PORT, () => {
  console.log(`🚀 條碼掃描器伺服器啟動成功！`);
  console.log(`📱 開啟瀏覽器訪問: http://localhost:${PORT}`);
  console.log(`💬 留言板功能已啟用`);
  console.log(`📁 留言資料儲存在: ${path.basename(DATA_FILE)}`);
});
