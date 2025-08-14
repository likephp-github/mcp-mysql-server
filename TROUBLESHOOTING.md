# Claude Desktop MCP Server 故障排除指南

## 常見問題與解決方案

### ❌ 問題 1: Configuration validation failed (環境變數未找到)

**錯誤訊息：**
```
Configuration validation failed: ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["DB_USER"],
    "message": "Required"
  }
]
```

**原因：** Claude Desktop 無法載入 `.env` 檔案中的環境變數

**解決方案：**

#### 🚀 方案 A: 自動修復（推薦）
```bash
npm run claude:fix-env
```

#### 🔧 方案 B: 手動修復
編輯 Claude 配置檔案：
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

將配置改為包含環境變數：
```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/path/to/your/project/dist/index.js"],
      "cwd": "/path/to/your/project",
      "env": {
        "DB_HOST": "127.0.0.1",
        "DB_PORT": "13348",
        "DB_USER": "your_username",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database",
        "DB_SSL": "false"
      }
    }
  }
}
```

#### 🔧 方案 C: 使用啟動腳本
修改 Claude 配置使用啟動腳本：
```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "/path/to/your/project/mcp-start.sh",
      "cwd": "/path/to/your/project"
    }
  }
}
```

---

### ❌ 問題 2: Server does not support secure connection

**錯誤訊息：**
```
Database query error: Error: Server does not support secure connection
```

**原因：** SSL 配置錯誤

**解決方案：**
確保 `.env` 檔案中設置：
```env
DB_SSL=false
```

或在 Claude 配置的 env 中設置：
```json
"DB_SSL": "false"
```

---

### ❌ 問題 3: Claude Desktop 看不到工具

**症狀：** 在 Claude 中詢問可用工具時，沒有看到資料庫相關工具

**排查步驟：**

1. **檢查配置狀態：**
   ```bash
   npm run claude:check
   ```

2. **查看 Claude 日誌：**
   ```bash
   tail -f ~/Library/Logs/Claude/main.log
   ```

3. **手動測試 MCP Server：**
   ```bash
   npm run tools:all
   ```

4. **重啟 Claude Desktop** 並等待完全載入

---

### ❌ 問題 4: JSON 格式錯誤

**錯誤訊息：** 配置檔案無法解析

**解決方案：**
```bash
# 檢查 JSON 格式
python3 -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 重新生成配置
npm run claude:setup
```

---

### ❌ 問題 5: 資料庫連線失敗

**錯誤訊息：**
```
Database connection: FAILED
```

**排查步驟：**

1. **測試直接連線：**
   ```bash
   cd /path/to/project
   node -e "
   import mysql from 'mysql2/promise';
   const conn = await mysql.createConnection({
     host: '127.0.0.1',
     port: 13348,
     user: 'hf-eso-user',
     password: 'z#U7yBn@d4Rp',
     database: 'hf_eso'
   });
   console.log('連線成功');
   await conn.end();
   "
   ```

2. **檢查資料庫服務：**
   ```bash
   # 檢查 MySQL/MariaDB 是否運行
   brew services list | grep mysql
   # 或
   brew services list | grep mariadb
   ```

3. **檢查連線參數：**
   - 主機地址和端口
   - 用戶名和密碼
   - 資料庫名稱

---

## 調試工具

### 📋 完整檢查
```bash
npm run claude:check
```

### 🧪 測試 MCP Server
```bash
npm run tools:all
```

### 📝 查看配置
```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 📊 查看日誌
```bash
# 實時日誌
tail -f ~/Library/Logs/Claude/main.log

# 最近的錯誤
grep -i error ~/Library/Logs/Claude/main.log | tail -10
```

### 🔄 重置配置
```bash
# 備份現有配置
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/claude_config_backup.json

# 重新設置
npm run claude:setup
```

---

## 成功配置檢查清單

- [ ] ✅ MCP Server 可以獨立運行 (`npm run tools:all`)
- [ ] ✅ `.env` 檔案包含所有必要變數
- [ ] ✅ Claude 配置檔案格式正確
- [ ] ✅ 環境變數在 Claude 配置中正確設置
- [ ] ✅ Claude Desktop 已重啟
- [ ] ✅ 在 Claude 中可以看到資料庫工具
- [ ] ✅ 資料庫連線測試成功

---

## 聯絡支援

如果以上方法都無法解決問題，請提供以下資訊：

1. 完整的錯誤日誌
2. `.env` 檔案內容（隱藏密碼）
3. Claude 配置檔案內容
4. `npm run tools:all` 的輸出結果
5. 作業系統版本和 Claude Desktop 版本

---

## 快速修復指令

```bash
# 一鍵修復環境變數問題
npm run claude:fix-env

# 檢查所有配置
npm run claude:check

# 測試 MCP Server
npm run tools:all

# 重新設置 Claude Desktop
npm run claude:setup
```