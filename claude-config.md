# 將 MCP MySQL Server 掛載到 Claude Desktop

## 步驟 1: 準備 MCP Server

確保您的 MCP Server 已建置完成：

```bash
npm install
npm run build
```

## 步驟 2: 創建 .env 檔案

在專案根目錄創建 `.env` 檔案：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_SSL=false
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000
```

## 步驟 3: 配置 Claude Desktop

### macOS 配置

編輯 Claude Desktop 的配置檔案：

```bash
# 開啟配置檔案
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

或者手動編輯檔案：`~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows 配置

編輯檔案：`%APPDATA%\Claude\claude_desktop_config.json`

## 步驟 4: 添加 MCP Server 配置

在配置檔案中添加以下內容：

```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector/dist/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "your_username",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "your_database",
        "DB_SSL": "false"
      }
    }
  }
}
```

### 使用 .env 檔案的配置方式（推薦）

```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector/dist/index.js"],
      "cwd": "/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector"
    }
  }
}
```

## 步驟 5: 重啟 Claude Desktop

完成配置後，重新啟動 Claude Desktop 應用程式。

## 步驟 6: 驗證連接

在 Claude 中，您現在可以使用以下工具：

1. **execute_query** - 執行 SQL 查詢
2. **list_tables** - 列出所有資料表
3. **describe_table** - 查看資料表結構
4. **test_connection** - 測試資料庫連接

## 使用範例

在 Claude 中您可以這樣使用：

```
請幫我列出資料庫中的所有資料表
```

或

```
請執行這個查詢：SELECT * FROM users LIMIT 10
```

## 疑難排解

### 1. 檢查 MCP Server 是否正常運行

```bash
cd /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector
npm run dev
```

### 2. 檢查資料庫連接

確保：
- MySQL/MariaDB 服務正在運行
- 資料庫連接資訊正確
- 用戶有適當的權限

### 3. 檢查 Claude 配置

- 確保 JSON 格式正確
- 檢查檔案路徑是否正確
- 重啟 Claude Desktop

### 4. 查看 Claude 日誌

macOS: `~/Library/Logs/Claude/`
Windows: `%LOCALAPPDATA%\Claude\logs\`

## 安全提醒

- 不要將包含敏感資訊的配置檔案提交到版本控制
- 使用強密碼
- 考慮在生產環境中啟用 SSL
- 定期檢查資料庫存取權限