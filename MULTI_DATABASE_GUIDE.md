# 多資料庫連線設定指南

## 概述

MCP MySQL Server 現在支援同時連接多個資料庫，您可以在同一個 MCP Server 中管理多個 MySQL/MariaDB 資料庫連線。

## 功能特點

✅ **向下兼容**：現有的單資料庫配置仍然有效
✅ **多連線支援**：可同時連接多個不同的資料庫
✅ **連線管理**：列出、測試和獲取所有連線資訊
✅ **預設連線**：指定默認使用的資料庫連線
✅ **工具選擇**：每個資料庫操作都可以指定使用特定連線

## 配置方式

### 方法 1: 多資料庫配置

創建 `.env` 檔案，包含多個資料庫連線：

```env
# 指定可用的連線（逗號分隔）
DB_CONNECTIONS=main,test,analytics

# 預設連線
DEFAULT_DB=main

# 主資料庫連線 (main)
DB_MAIN_HOST=127.0.0.1
DB_MAIN_PORT=3306
DB_MAIN_USER=main_user
DB_MAIN_PASSWORD=main_password
DB_MAIN_NAME=main_database
DB_MAIN_SSL=false

# 測試資料庫連線 (test)
DB_TEST_HOST=localhost
DB_TEST_PORT=3307
DB_TEST_USER=test_user
DB_TEST_PASSWORD=test_password
DB_TEST_NAME=test_database
DB_TEST_SSL=false

# 分析資料庫連線 (analytics)
DB_ANALYTICS_HOST=analytics-server.com
DB_ANALYTICS_PORT=3306
DB_ANALYTICS_USER=analytics_user
DB_ANALYTICS_PASSWORD=analytics_password
DB_ANALYTICS_NAME=analytics_db
DB_ANALYTICS_SSL=true

# 共用設定
DB_CONNECTION_LIMIT=10
DB_TIMEOUT=60000
```

### 方法 2: 單資料庫配置（向下兼容）

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

## 工具使用說明

### 新增的工具

#### 1. `list_connections` - 列出所有連線
列出所有可用的資料庫連線，並標示預設連線。

**參數：** 無

**範例使用：**
```
請列出所有可用的資料庫連線
```

#### 2. `get_connection_info` - 獲取連線資訊
顯示特定連線的詳細資訊（不包含密碼）。

**參數：**
- `connection` (可選): 連線名稱，不指定則使用預設連線

**範例使用：**
```
請顯示 analytics 連線的資訊
```

#### 3. `test_all_connections` - 測試所有連線
同時測試所有配置的資料庫連線。

**參數：** 無

**範例使用：**
```
請測試所有資料庫連線的狀態
```

### 更新的工具

所有現有工具都新增了 `connection` 參數：

#### 1. `execute_query` - 執行查詢
**新參數：**
- `connection` (可選): 指定要使用的資料庫連線

**範例使用：**
```
請在 test 資料庫執行查詢：SELECT COUNT(*) FROM users
```

#### 2. `list_tables` - 列出資料表
**新參數：**
- `connection` (可選): 指定要查詢的資料庫連線

**範例使用：**
```
請列出 analytics 資料庫中的所有資料表
```

#### 3. `describe_table` - 查看表結構
**新參數：**
- `connection` (可選): 指定要查詢的資料庫連線

**範例使用：**
```
請顯示 main 資料庫中 users 資料表的結構
```

#### 4. `test_connection` - 測試連線
**新參數：**
- `connection` (可選): 指定要測試的資料庫連線

**範例使用：**
```
請測試 analytics 資料庫的連線狀態
```

## Claude Desktop 配置

### 單資料庫模式（現有配置仍有效）
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

### 多資料庫模式
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
        "DB_MAIN_PASSWORD": "main_password",
        "DB_MAIN_NAME": "main_db",
        "DB_MAIN_SSL": "false",
        "DB_TEST_HOST": "localhost",
        "DB_TEST_PORT": "3307",
        "DB_TEST_USER": "test_user",
        "DB_TEST_PASSWORD": "test_password",
        "DB_TEST_NAME": "test_db",
        "DB_TEST_SSL": "false",
        "DB_ANALYTICS_HOST": "analytics.example.com",
        "DB_ANALYTICS_PORT": "3306",
        "DB_ANALYTICS_USER": "analytics_user",
        "DB_ANALYTICS_PASSWORD": "analytics_password",
        "DB_ANALYTICS_NAME": "analytics_db",
        "DB_ANALYTICS_SSL": "true",
        "DB_CONNECTION_LIMIT": "10",
        "DB_TIMEOUT": "60000"
      }
    }
  }
}
```

## 命令行測試

### 測試新功能
```bash
# 列出所有連線
node test-mcp.js connections

# 測試所有連線
node test-mcp.js test-all

# 完整測試（包含多連線功能）
node test-mcp.js all
```

### 測試特定連線
```bash
# 測試特定連線的資料表
node test-mcp.js tables

# 在特定連線執行查詢（需要在代碼中指定 connection 參數）
```

## 使用範例

### 在 Claude 中使用多資料庫

```
# 基本操作
"請列出所有可用的資料庫連線"
"請測試所有資料庫連線的狀態"

# 指定特定資料庫操作
"請列出 test 資料庫中的所有資料表"
"請在 analytics 資料庫執行查詢：SELECT COUNT(*) FROM events"
"請顯示 main 資料庫中 users 資料表的結構"

# 比較不同資料庫
"請比較 main 和 test 資料庫中的 users 資料表結構"
"請統計所有資料庫中的資料表數量"
```

## 設定最佳實踐

### 1. 命名規範
- 使用有意義的連線名稱：`main`, `test`, `staging`, `analytics`
- 避免使用特殊字符，只使用字母、數字和下劃線

### 2. 安全性
- 不同環境使用不同的使用者帳號
- 生產環境啟用 SSL 連線
- 使用最小權限原則

### 3. 效能考量
- 合理設定連線池大小 (`DB_CONNECTION_LIMIT`)
- 適當的連線超時設定 (`DB_TIMEOUT`)
- 監控連線使用情況

## 疑難排解

### 常見問題

1. **連線找不到**
   ```
   Database connection 'xxx' not found
   ```
   - 檢查 `DB_CONNECTIONS` 是否包含該連線名稱
   - 檢查對應的環境變數是否正確設定

2. **配置錯誤**
   ```
   Missing required configuration for database connection
   ```
   - 確保每個連線都有必要的參數：`HOST`, `USER`, `PASSWORD`, `NAME`

3. **預設連線錯誤**
   ```
   Default database connection 'xxx' not found
   ```
   - 檢查 `DEFAULT_DB` 是否在 `DB_CONNECTIONS` 列表中

### 檢查工具

```bash
# 驗證配置
npm run claude:check

# 測試所有功能
npm run tools:all

# 查看日誌
tail -f ~/Library/Logs/Claude/main.log
```

## 升級指南

### 從單資料庫升級到多資料庫

1. **保持現有配置**（無需修改，向下兼容）
2. **或者遷移到新格式**：
   ```env
   # 舊格式
   DB_HOST=localhost
   DB_USER=user
   # ...
   
   # 新格式
   DB_CONNECTIONS=main
   DEFAULT_DB=main
   DB_MAIN_HOST=localhost
   DB_MAIN_USER=user
   # ...
   ```

3. **重新建置和重啟**：
   ```bash
   npm run build
   # 重啟 Claude Desktop
   ```

多資料庫功能讓您可以更靈活地管理不同環境和用途的資料庫，提升開發和運營效率！