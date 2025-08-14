# MCP MySQL/MariaDB Database Server

一個功能完整的 Model Context Protocol (MCP) 伺服器，提供 MySQL 和 MariaDB 資料庫的完整操作能力。

## 🌟 功能特色

### 🗃️ 多資料庫支援
- **同時連接多個資料庫** - 在單一 MCP Server 中管理多個 MySQL/MariaDB 實例
- **靈活連線命名** - 支援自定義連線名稱 (`main`, `test`, `analytics`, `prod` 等)
- **預設連線設定** - 指定預設使用的資料庫連線
- **向下兼容** - 現有單資料庫配置無需修改即可使用

### 🌐 多傳輸模式
- **stdio 模式** - 標準輸入/輸出，適用於本地 Claude Desktop
- **HTTP 模式** - HTTP/SSE 伺服器，支援外網連入和遠程存取
- **both 模式** - 同時提供 stdio 和 HTTP 兩種連接方式

### 🔒 企業級安全
- **SQL 注入防護** - 自動檢測並阻止危險的 SQL 操作
- **連線池管理** - 有效管理資料庫連線資源
- **SSL/TLS 支援** - 安全的資料庫連線加密
- **CORS 控制** - 可配置的跨域請求設定
- **API 金鑰認證** - 可選的 HTTP 端點安全認證

### 🛠️ 完整工具集
1. `execute_query` - 執行 SQL 查詢與更新
2. `list_tables` - 列出資料庫中的所有資料表
3. `describe_table` - 查看資料表結構和欄位資訊
4. `test_connection` - 測試特定資料庫連線
5. `list_connections` - 列出所有可用的資料庫連線
6. `get_connection_info` - 獲取連線詳細資訊
7. `test_all_connections` - 批次測試所有資料庫連線

## 🚀 快速開始

### 1. 安裝依賴

```bash
# 安裝 Node.js 依賴
npm install

# 建置專案
npm run build
```

### 2. 配置資料庫

建立 `.env` 檔案：

#### 單資料庫配置 (向下兼容)
```env
# 基本資料庫設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
DB_SSL=false

# 連線池設定
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000

# MCP 伺服器設定
MCP_TRANSPORT_MODE=stdio
```

#### 多資料庫配置 (推薦)
```env
# 定義連線清單
DB_CONNECTIONS=main,test,analytics
DEFAULT_DB=main

# 主資料庫連線
DB_MAIN_HOST=localhost
DB_MAIN_PORT=3306
DB_MAIN_USER=main_user
DB_MAIN_PASSWORD="complex@pass#123"
DB_MAIN_NAME=main_database
DB_MAIN_SSL=false

# 測試資料庫連線
DB_TEST_HOST=test-server.com
DB_TEST_PORT=3306
DB_TEST_USER=test_user
DB_TEST_PASSWORD="test$pass@456"
DB_TEST_NAME=test_database
DB_TEST_SSL=true

# 分析資料庫連線
DB_ANALYTICS_HOST=analytics.company.com
DB_ANALYTICS_PORT=3306
DB_ANALYTICS_USER=analytics_user
DB_ANALYTICS_PASSWORD="analytics#789$"
DB_ANALYTICS_NAME=analytics_db
DB_ANALYTICS_SSL=true

# 連線池設定
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000

# MCP 伺服器設定
MCP_TRANSPORT_MODE=both
MCP_SERVER_PORT=3001
MCP_SERVER_HOST=0.0.0.0
MCP_ALLOWED_ORIGINS=*
MCP_ENABLE_CORS=true
```

### 3. 配置 Claude Desktop

#### 自動配置 (推薦)
```bash
# 執行自動配置腳本
./fix-claude-env.sh
```

#### 手動配置
編輯 Claude Desktop 配置檔案：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**單資料庫配置：**
```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/path/to/project/dist/index.js"],
      "cwd": "/path/to/project",
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "username",
        "DB_PASSWORD": "password",
        "DB_NAME": "database",
        "DB_SSL": "false"
      }
    }
  }
}
```

**多資料庫配置：**
```json
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/path/to/project/dist/index.js"],
      "cwd": "/path/to/project",
      "env": {
        "DB_CONNECTIONS": "main,test,analytics",
        "DEFAULT_DB": "main",
        "DB_MAIN_HOST": "localhost",
        "DB_MAIN_PORT": "3306",
        "DB_MAIN_USER": "main_user",
        "DB_MAIN_PASSWORD": "password",
        "DB_MAIN_NAME": "main_database",
        "DB_MAIN_SSL": "false",
        "DB_TEST_HOST": "test-server.com",
        "DB_TEST_PORT": "3306",
        "DB_TEST_USER": "test_user", 
        "DB_TEST_PASSWORD": "test_password",
        "DB_TEST_NAME": "test_database",
        "DB_TEST_SSL": "true",
        "MCP_TRANSPORT_MODE": "both",
        "MCP_SERVER_PORT": "3001",
        "MCP_SERVER_HOST": "0.0.0.0",
        "MCP_ALLOWED_ORIGINS": "*",
        "MCP_ENABLE_CORS": "true"
      }
    }
  }
}
```

### 4. 啟動服務

```bash
# 直接啟動 (stdio 模式)
npm run dev

# 啟動 HTTP 模式
MCP_TRANSPORT_MODE=http npm run dev

# 同時啟動兩種模式
MCP_TRANSPORT_MODE=both npm run dev

# 生產模式啟動
npm run start
```

## 📖 使用指南

### 🗃️ 多資料庫操作

#### 列出所有連線
```
請列出所有可用的資料庫連線
```
回應範例：
```
Available database connections:
main (default)
test
analytics
```

#### 切換資料庫操作
```
請列出 test 資料庫中的所有資料表
```

```
請在 analytics 資料庫執行查詢：SELECT COUNT(*) FROM events
```

```
請顯示 main 資料庫中 users 資料表的結構
```

#### 測試連線狀態
```
請測試所有資料庫連線的狀態
```

### 🌐 外網連入使用

當使用 HTTP 模式時，可透過以下端點存取：

```bash
# 健康檢查
curl http://localhost:3001/health

# API 資訊  
curl http://localhost:3001/api/info

# MCP 端點 (SSE)
curl -H "Accept: text/event-stream" http://localhost:3001/mcp
```

### 🔍 常用查詢範例

```sql
-- 查看資料表清單
SHOW TABLES;

-- 查看表結構
DESCRIBE users;

-- 基本查詢
SELECT * FROM users LIMIT 10;

-- 統計查詢
SELECT COUNT(*) as user_count FROM users;

-- 聯合查詢
SELECT u.name, p.title 
FROM users u 
JOIN posts p ON u.id = p.user_id 
LIMIT 5;
```

## ⚙️ 配置參數

### 🗃️ 資料庫設定

#### 單資料庫模式
| 參數 | 說明 | 預設值 | 範例 |
|-----|------|--------|------|
| `DB_HOST` | 資料庫主機 | `localhost` | `127.0.0.1` |
| `DB_PORT` | 資料庫端口 | `3306` | `3306` |
| `DB_USER` | 使用者名稱 | - | `root` |
| `DB_PASSWORD` | 密碼 | - | `"complex@pass#123"` |
| `DB_NAME` | 資料庫名稱 | - | `myapp` |
| `DB_SSL` | SSL 連線 | `false` | `true` |

#### 多資料庫模式
| 參數格式 | 說明 | 範例 |
|---------|------|------|
| `DB_CONNECTIONS` | 連線清單 | `main,test,prod` |
| `DEFAULT_DB` | 預設連線 | `main` |
| `DB_{NAME}_HOST` | 指定連線主機 | `DB_PROD_HOST=prod-server.com` |
| `DB_{NAME}_PORT` | 指定連線端口 | `DB_PROD_PORT=3306` |
| `DB_{NAME}_USER` | 指定連線使用者 | `DB_PROD_USER=prod_user` |
| `DB_{NAME}_PASSWORD` | 指定連線密碼 | `DB_PROD_PASSWORD="prod@123"` |
| `DB_{NAME}_NAME` | 指定連線資料庫 | `DB_PROD_NAME=production` |
| `DB_{NAME}_SSL` | 指定連線 SSL | `DB_PROD_SSL=true` |

### 🌐 MCP 服務設定

| 參數 | 說明 | 預設值 | 選項 |
|-----|------|--------|------|
| `MCP_TRANSPORT_MODE` | 傳輸模式 | `stdio` | `stdio`, `http`, `both` |
| `MCP_SERVER_PORT` | HTTP 端口 | `3000` | `1-65535` |
| `MCP_SERVER_HOST` | 監聽地址 | `0.0.0.0` | IP 地址 |
| `MCP_ALLOWED_ORIGINS` | CORS 來源 | `*` | 域名清單 |
| `MCP_ENABLE_CORS` | 啟用 CORS | `true` | `true`, `false` |
| `MCP_API_KEY` | API 金鑰 | - | 自訂金鑰 |

### 🔗 連線池設定

| 參數 | 說明 | 預設值 |
|-----|------|--------|
| `DB_CONNECTION_LIMIT` | 連線池大小 | `10` |
| `DB_TIMEOUT` | 連線超時 (ms) | `60000` |

## 🧪 測試工具

### 本地測試
```bash
# 測試工具清單
node test-mcp.js list

# 測試資料庫連線
node test-mcp.js test

# 測試所有連線
node test-mcp.js test-all

# 列出連線
node test-mcp.js connections

# 列出資料表
node test-mcp.js tables

# 執行完整測試
node test-mcp.js all
```

### HTTP 模式測試
```bash
# 測試 HTTP 端點
node test-http.js

# 指定服務器 URL
MCP_SERVER_URL=http://localhost:3001 node test-http.js
```

### 配置檢查
```bash
# 檢查 Claude Desktop 配置
./fix-claude-env-test.sh

# 測試密碼讀取
./test-password.sh
```

## 🔧 故障排除

### 常見問題

#### 1. 連線失敗
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**解決方案：**
- 確認 MySQL/MariaDB 服務正在運行
- 檢查主機和端口設定
- 驗證防火牆設定

#### 2. 認證錯誤
```
Error: Access denied for user 'username'@'host'
```
**解決方案：**
- 確認使用者名稱和密碼正確
- 檢查使用者權限
- 確認密碼包含特殊字符時使用引號

#### 3. SSL 連線問題
```
Error: Server does not support secure connection
```
**解決方案：**
- 確認伺服器支援 SSL
- 檢查 SSL 憑證設定
- 嘗試設定 `DB_SSL=false`

#### 4. Claude Desktop 整合問題
```
MCP server mysql-database failed to start
```
**解決方案：**
- 執行 `./fix-claude-env.sh` 重新配置
- 檢查配置檔案 JSON 格式
- 確認路徑和環境變數正確

### 偵錯模式

```bash
# 啟用詳細日誌
DEBUG=1 npm run dev

# 檢查連線狀態
npm run tools:test

# 查看伺服器日誌
tail -f ~/Library/Logs/Claude/main.log
```

## 📁 專案結構

```
MCP-MySQL-Server/
├── src/
│   ├── config.ts          # 配置管理和驗證
│   ├── database.ts        # 資料庫連線管理
│   ├── server.ts          # stdio 模式 MCP 伺服器
│   ├── http-server.ts     # HTTP 模式 MCP 伺服器  
│   ├── tools.ts           # MCP 工具定義
│   ├── validators.ts      # SQL 驗證和安全檢查
│   └── index.ts           # 主程式入口
├── dist/                  # 編譯後的 JavaScript 檔案
├── docs/                  # 文檔檔案
│   ├── MULTI_DATABASE_GUIDE.md
│   └── API_REFERENCE.md
├── scripts/
│   ├── fix-claude-env.sh         # Claude Desktop 配置修復
│   ├── fix-claude-env-test.sh    # 配置檢查腳本
│   ├── test-mcp.js              # MCP 功能測試
│   ├── test-http.js             # HTTP 模式測試
│   └── test-password.sh         # 密碼讀取測試
├── .env.example           # 環境變數範例
├── .env.multi.example     # 多資料庫配置範例
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 開發指南

### 建置和開發

```bash
# 開發模式 (監視檔案變更)
npm run dev

# 建置專案
npm run build

# 生產模式啟動
npm run start

# 執行測試
npm run test

# 檢查程式碼格式
npm run lint

# 修復程式碼格式
npm run lint:fix
```

### 貢獻指南

1. Fork 本專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙋‍♂️ 支援與反饋

- 🐛 **問題回報**: [GitHub Issues](https://github.com/likephp-github/mcp-mysql-server/issues)
- 💡 **功能建議**: [GitHub Discussions](https://github.com/likephp-github/mcp-mysql-server/wiki)
- 📧 **聯絡方式**: likephp@hummingfood.com

## 📈 更新日誌

### v1.0.0 (2025-08-14)
- ✨ 多資料庫連線支援
- 🌐 HTTP/SSE 外網連入功能
- 🔒 企業級安全功能
- 🛠️ 完整工具集 (7個工具)
- 🔧 自動配置腳本
- 📖 完整文檔和使用指南
- 🧪 完整測試套件
- 🔐 特殊字符密碼支援

---

**MCP MySQL Server** - 讓資料庫操作更簡單、更安全、更強大！ 🚀✨