# Claude Desktop MCP Server 配置指南

## 步驟 1: 確保 MCP Server 正常運行

在配置 Claude Desktop 之前，先確認您的 MCP Server 工作正常：

```bash
cd /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector

# 建置專案
npm run build

# 測試 MCP Server
npm run tools:all
```

確認看到以下成功訊息：
- ✅ Database connection: SUCCESS
- ✅ 列出資料表成功
- ✅ SQL 查詢成功

## 步驟 2: 找到 Claude Desktop 配置檔案

### macOS
Claude Desktop 的配置檔案位於：
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### 檢查檔案是否存在
```bash
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

如果檔案不存在，需要先創建：
```bash
mkdir -p ~/Library/Application\ Support/Claude/
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

## 步驟 3: 編輯配置檔案

### 打開配置檔案
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

或使用您喜歡的編輯器：
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
# 或
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 方法 1: 基本配置 (推薦)

將以下內容貼入配置檔案：

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

### 方法 2: 包含環境變數的配置

如果您想在配置中直接指定資料庫設定（不推薦用於生產環境）：

```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector/dist/index.js"],
      "cwd": "/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector",
      "env": {
        "DB_HOST": "127.0.0.1",
        "DB_PORT": "13348",
        "DB_USER": "hf-eso-user",
        "DB_PASSWORD": "z#U7yBn@d4Rp",
        "DB_NAME": "hf_eso",
        "DB_SSL": "false"
      }
    }
  }
}
```

### 方法 3: 使用 npm script (替代方案)

```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector"
    }
  }
}
```

## 步驟 4: 驗證配置

### 檢查 JSON 語法
確保您的 JSON 格式正確，可以使用線上 JSON 驗證器或：

```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool
```

如果沒有錯誤訊息，表示格式正確。

### 檢查檔案權限
```bash
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

確保檔案可讀。

## 步驟 5: 重啟 Claude Desktop

1. 完全退出 Claude Desktop 應用程式
2. 重新啟動 Claude Desktop
3. 等待應用程式完全載入

## 步驟 6: 測試 MCP 整合

在 Claude Desktop 中測試以下對話：

### 測試 1: 檢查工具可用性
```
請列出您可以使用的資料庫工具
```

應該看到 4 個工具：
- execute_query
- list_tables
- describe_table
- test_connection

### 測試 2: 測試資料庫連線
```
請測試資料庫連線
```

應該收到連線成功的確認。

### 測試 3: 列出資料表
```
請列出資料庫中的所有資料表
```

應該看到 15 個資料表的列表。

### 測試 4: 查看表結構
```
請顯示 users 資料表的結構
```

應該看到 users 表的完整欄位資訊。

### 測試 5: 執行查詢
```
請執行查詢：SELECT COUNT(*) as total_users FROM users
```

應該看到用戶數量的結果。

## 疑難排解

### 問題 1: Claude Desktop 沒有看到 MCP Server

**可能原因：**
- JSON 格式錯誤
- 檔案路徑不正確
- 沒有重啟 Claude Desktop

**解決方法：**
```bash
# 檢查配置檔案語法
python -c "import json; json.load(open('/Users/$(whoami)/Library/Application Support/Claude/claude_desktop_config.json'))"

# 檢查檔案路徑是否存在
ls -la /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector/dist/index.js
```

### 問題 2: MCP Server 無法啟動

**檢查方法：**
```bash
# 手動測試 MCP Server
cd /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector
node dist/index.js
```

如果出現錯誤，檢查：
- 是否執行了 `npm run build`
- `.env` 檔案是否存在且配置正確
- 資料庫是否可連接

### 問題 3: 權限錯誤

```bash
# 確保檔案有正確權限
chmod 644 ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 問題 4: 環境變數未載入

確保 `.env` 檔案在正確位置：
```bash
ls -la /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector/.env
```

## 檢查日誌

### Claude Desktop 日誌位置
```
~/Library/Logs/Claude/
```

### 查看日誌
```bash
# 查看最新日誌
tail -f ~/Library/Logs/Claude/main.log

# 或查看所有日誌檔案
ls -la ~/Library/Logs/Claude/
```

## 完整配置檢查清單

- [ ] MCP Server 可以獨立運行 (`npm run tools:all` 成功)
- [ ] 配置檔案路徑正確
- [ ] JSON 格式有效
- [ ] 檔案權限正確
- [ ] Claude Desktop 已重啟
- [ ] 可以在 Claude 中看到資料庫工具
- [ ] 資料庫連線測試成功

## 安全建議

1. **不要在配置檔案中硬編碼密碼**
   - 優先使用 `.env` 檔案
   - 考慮使用環境變數

2. **檔案權限**
   - 配置檔案應該只有您可讀
   - 避免在版本控制中包含敏感資訊

3. **網路安全**
   - 確保資料庫只接受本地連線
   - 使用強密碼
   - 考慮啟用 SSL（如果支援）

配置完成後，您就可以在 Claude Desktop 中直接使用自然語言操作您的 MySQL/MariaDB 資料庫了！