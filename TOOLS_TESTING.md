# MCP Tools 命令行測試指南

## 快速開始

### 1. 建置專案
```bash
npm run build
```

### 2. 基本測試指令

#### 使用 npm scripts（推薦）
```bash
# 列出所有可用工具
npm run tools:list

# 測試資料庫連線
npm run tools:test

# 列出資料表（需要有效的資料庫連線）
npm run tools:tables
```

#### 使用直接指令
```bash
# 列出所有工具
node simple-test.js list

# 測試資料庫連線
node simple-test.js test

# 列出資料表
node simple-test.js tables

# 查看資料表結構
node simple-test.js describe users

# 執行 SQL 查詢
node simple-test.js query "SELECT 1 as test"
node simple-test.js query "SHOW DATABASES"
```

## 進階測試

### 互動模式客戶端
```bash
# 啟動互動模式
node mcp-client.js

# 在互動模式中使用的命令：
mcp> list                    # 列出工具
mcp> test_connection         # 測試連線
mcp> list_tables            # 列出資料表
mcp> describe users         # 查看 users 表結構
mcp> query SELECT 1         # 執行查詢
mcp> exit                   # 退出
```

### 批量測試
```bash
# 執行自動化測試
./test-tools.sh
```

## 工具說明

### 1. execute_query
執行 SQL 查詢

**參數:**
- `query` (string): SQL 查詢語句
- `params` (array, 可選): 查詢參數

**範例:**
```bash
node simple-test.js query "SELECT * FROM users LIMIT 5"
node simple-test.js query "SELECT COUNT(*) as total FROM users"
```

### 2. list_tables
列出資料庫中的所有資料表

**參數:** 無

**範例:**
```bash
node simple-test.js tables
```

### 3. describe_table
查看資料表的結構

**參數:**
- `table_name` (string): 資料表名稱

**範例:**
```bash
node simple-test.js describe users
node simple-test.js describe products
```

### 4. test_connection
測試資料庫連線

**參數:** 無

**範例:**
```bash
node simple-test.js test
```

## 常見問題

### Q: 連線失敗怎麼辦？
A: 檢查 `.env` 檔案中的資料庫設定：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_SSL=false
```

### Q: SSL 連線錯誤？
A: 在 `.env` 檔案中設定 `DB_SSL=false`，或確保資料庫支援 SSL

### Q: 如何查看詳細錯誤？
A: 檢查 MCP Server 的輸出，或查看 `mcp-server.log` 檔案

### Q: 工具沒有響應？
A: 確保：
1. 已執行 `npm run build`
2. 資料庫服務正在運行
3. 網路連線正常

## JSON-RPC 格式

如果您想要直接使用 JSON-RPC 協議，請求格式如下：

### 列出工具
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

### 調用工具
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "test_connection",
    "arguments": {}
  }
}
```

### 執行查詢
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "execute_query",
    "arguments": {
      "query": "SELECT 1 as test"
    }
  }
}
```

## 安全提醒

- 避免在生產環境執行危險的 SQL 操作
- 系統會自動阻擋 `DROP DATABASE`、`TRUNCATE` 等危險操作
- 對於 `DELETE` 和 `UPDATE` 不帶 `WHERE` 的語句會顯示警告
- 所有查詢都使用參數化查詢防止 SQL 注入

## 開發用途

這些工具主要用於：
- 開發和測試 MCP Server
- 驗證資料庫連線
- 調試 SQL 查詢
- 檢查資料表結構
- 整合測試