# MCP MySQL Server 安裝指南

## 📋 系統需求

### 必要環境
- **Node.js**: ≥ 18.0.0
- **npm**: ≥ 8.0.0
- **MySQL/MariaDB**: ≥ 5.7 / ≥ 10.2
- **Claude Desktop**: 最新版本

### 支援的作業系統
- ✅ macOS 10.15+
- ✅ Windows 10+
- ✅ Linux (Ubuntu 18.04+, CentOS 7+)

## 🚀 安裝步驟

### 步驟 1: 取得專案

```bash
# 使用 Git 克隆
git clone https://github.com/your-repo/mcp-mysql-server.git
cd mcp-mysql-server

# 或下載並解壓縮
wget https://github.com/your-repo/mcp-mysql-server/archive/main.zip
unzip main.zip
cd mcp-mysql-server-main
```

### 步驟 2: 安裝依賴

```bash
# 安裝 Node.js 依賴
npm install

# 建置 TypeScript 專案
npm run build
```

### 步驟 3: 配置資料庫

#### 3.1 建立配置檔案

```bash
# 複製範例配置
cp .env.example .env

# 編輯配置檔案
nano .env  # 或使用您偏好的編輯器
```

#### 3.2 單資料庫配置範例

```env
# 基本資料庫設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD="your_password_here"
DB_NAME=your_database
DB_SSL=false

# MCP 設定
MCP_TRANSPORT_MODE=stdio
```

#### 3.3 多資料庫配置範例

```env
# 連線定義
DB_CONNECTIONS=main,test,prod
DEFAULT_DB=main

# 主資料庫
DB_MAIN_HOST=localhost
DB_MAIN_PORT=3306
DB_MAIN_USER=main_user
DB_MAIN_PASSWORD="main_password"
DB_MAIN_NAME=main_db
DB_MAIN_SSL=false

# 測試資料庫
DB_TEST_HOST=test-server.com
DB_TEST_PORT=3306
DB_TEST_USER=test_user
DB_TEST_PASSWORD="test@password#123"
DB_TEST_NAME=test_db
DB_TEST_SSL=true

# 生產資料庫
DB_PROD_HOST=prod-server.com
DB_PROD_PORT=3306
DB_PROD_USER=prod_user
DB_PROD_PASSWORD="prod$ecure&password"
DB_PROD_NAME=prod_db
DB_PROD_SSL=true

# MCP 設定
MCP_TRANSPORT_MODE=both
MCP_SERVER_PORT=3001
MCP_SERVER_HOST=0.0.0.0
MCP_ALLOWED_ORIGINS=*
MCP_ENABLE_CORS=true
```

### 步驟 4: 配置 Claude Desktop

#### 4.1 自動配置 (推薦)

```bash
# 執行自動配置腳本
./fix-claude-env.sh
```

腳本會：
- 自動讀取 `.env` 檔案
- 檢測單/多資料庫模式
- 生成正確的 Claude Desktop 配置
- 備份現有配置
- 驗證 JSON 格式

#### 4.2 手動配置

如果自動配置失敗，可以手動編輯：

**配置檔案位置：**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**配置內容範例：**
```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/完整路徑/to/mcp-mysql-server/dist/index.js"],
      "cwd": "/完整路徑/to/mcp-mysql-server",
      "env": {
        "DB_CONNECTIONS": "main,test,prod",
        "DEFAULT_DB": "main",
        "DB_MAIN_HOST": "localhost",
        "DB_MAIN_PORT": "3306",
        "DB_MAIN_USER": "main_user",
        "DB_MAIN_PASSWORD": "main_password",
        "DB_MAIN_NAME": "main_db",
        "DB_MAIN_SSL": "false",
        "MCP_TRANSPORT_MODE": "both"
      }
    }
  }
}
```

### 步驟 5: 測試安裝

#### 5.1 基本功能測試

```bash
# 測試資料庫連線
npm run tools:test

# 列出可用工具
npm run tools:list

# 完整功能測試
npm run test
```

#### 5.2 多資料庫測試

```bash
# 測試所有連線
npm run test:connections

# 列出所有連線
node test-mcp.js connections
```

#### 5.3 HTTP 模式測試 (如果啟用)

```bash
# 啟動 HTTP 模式
MCP_TRANSPORT_MODE=http npm run dev &

# 測試 HTTP 端點
npm run test:http

# 手動測試
curl http://localhost:3001/health
```

#### 5.4 Claude Desktop 整合測試

```bash
# 檢查配置
npm run claude:check

# 重新啟動 Claude Desktop
# 然後在 Claude 中測試：
# "請列出所有可用的資料庫連線"
```

## 🔧 常見安裝問題

### 問題 1: Node.js 版本不相容
```
Error: The engine "node" is incompatible with this module
```
**解決方案：**
```bash
# 更新 Node.js 到 18.0.0 或更高版本
nvm install 18
nvm use 18

# 或使用官方安裝器
# https://nodejs.org/
```

### 問題 2: 依賴安裝失敗
```
npm ERR! peer dep missing
```
**解決方案：**
```bash
# 清除緩存重新安裝
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 問題 3: TypeScript 編譯錯誤
```
Error TS2307: Cannot find module
```
**解決方案：**
```bash
# 確保 TypeScript 已安裝
npm install -g typescript
npm install

# 重新建置
npm run build
```

### 問題 4: 資料庫連線失敗
```
Error: connect ECONNREFUSED
```
**解決方案：**
1. 確認 MySQL/MariaDB 服務運行中
2. 檢查防火牆設定
3. 驗證連線參數
```bash
# 測試資料庫連線
mysql -h localhost -P 3306 -u username -p database_name
```

### 問題 5: Claude Desktop 整合問題
```
MCP server mysql-database failed to start
```
**解決方案：**
```bash
# 重新配置
./fix-claude-env.sh

# 檢查配置
npm run claude:check

# 查看日誌
tail -f ~/Library/Logs/Claude/main.log
```

### 問題 6: 特殊字符密碼問題
```
Database connection failed: Authentication failed
```
**解決方案：**
- 確保密碼用雙引號包圍：`"complex@password#123"`
- 檢查環境變數是否正確讀取：`./test-password.sh`

## 📖 進階配置

### SSL/TLS 設定

```env
# 啟用 SSL
DB_MAIN_SSL=true

# 自訂 SSL 選項 (如需要)
DB_MAIN_SSL_CA=/path/to/ca.pem
DB_MAIN_SSL_KEY=/path/to/key.pem
DB_MAIN_SSL_CERT=/path/to/cert.pem
```

### 效能調整

```env
# 連線池設定
DB_CONNECTION_LIMIT=20        # 增加連線數
DB_TIMEOUT=30000              # 減少超時時間
DB_ACQUIRE_TIMEOUT=10000      # 連線獲取超時
```

### 安全設定

```env
# HTTP 模式安全設定
MCP_API_KEY=your_secure_api_key_here
MCP_ALLOWED_ORIGINS=https://your-domain.com,https://another-domain.com
MCP_ENABLE_CORS=true
```

## ✅ 安裝檢查清單

- [ ] Node.js ≥ 18.0.0 已安裝
- [ ] MySQL/MariaDB 運行正常
- [ ] 專案依賴已安裝 (`npm install`)
- [ ] TypeScript 已編譯 (`npm run build`)
- [ ] `.env` 檔案已正確配置
- [ ] 資料庫連線測試通過 (`npm run tools:test`)
- [ ] Claude Desktop 配置已更新
- [ ] 多資料庫功能測試通過 (如適用)
- [ ] HTTP 模式測試通過 (如適用)
- [ ] Claude Desktop 整合正常運作

## 📞 獲取協助

如果遇到安裝問題：

1. **檢查日誌檔案**：`~/Library/Logs/Claude/main.log`
2. **執行診斷腳本**：`npm run claude:check`
3. **查看問題回報**：[GitHub Issues](https://github.com/your-repo/issues)
4. **參考文檔**：
   - [多資料庫指南](docs/MULTI_DATABASE_GUIDE.md)
   - [API 參考](docs/API_REFERENCE.md)
   - [故障排除](docs/TROUBLESHOOTING.md)

安裝成功後，您就可以在 Claude Desktop 中使用強大的資料庫操作功能了！🎉