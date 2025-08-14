# 將 MCP MySQL Server 掛載到 VS Code

## 方法 1: 使用 Claude Dev 擴展（推薦）

### 步驟 1: 安裝 Claude Dev 擴展

在 VS Code 中：
1. 打開擴展商店 (Ctrl+Shift+X 或 Cmd+Shift+X)
2. 搜索 "Claude Dev"
3. 安裝官方的 Claude Dev 擴展

### 步驟 2: 配置 MCP Server

在您的專案根目錄創建或編輯 `.vscode/settings.json`：

```json
{
  "claude-dev.mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector/dist/index.js"],
      "cwd": "/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector"
    }
  }
}
```

### 步驟 3: 工作區配置（可選）

或者在工作區設定檔 `.vscode/settings.json` 中配置：

```json
{
  "claude-dev.mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

## 方法 2: 使用 MCP 客戶端擴展

### 步驟 1: 安裝 MCP 相關擴展

搜索並安裝以下擴展之一：
- "MCP Client"
- "Model Context Protocol"
- "AI Assistant with MCP"

### 步驟 2: 創建 MCP 配置檔案

在專案根目錄創建 `mcp-config.json`：

```json
{
  "servers": {
    "mysql-database": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": ".",
      "env": {}
    }
  }
}
```

### 步驟 3: VS Code 設定

在 `.vscode/settings.json` 中添加：

```json
{
  "mcp.configPath": "./mcp-config.json"
}
```

## 方法 3: 使用終端集成

### 步驟 1: 創建啟動腳本

在專案根目錄創建 `start-mcp.sh`：

```bash
#!/bin/bash
cd /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector
npm run build
node dist/index.js
```

使其可執行：
```bash
chmod +x start-mcp.sh
```

### 步驟 2: VS Code 任務配置

創建 `.vscode/tasks.json`：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Start MCP MySQL Server",
            "type": "shell",
            "command": "./start-mcp.sh",
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "new"
            },
            "runOptions": {
                "runOn": "default"
            }
        }
    ]
}
```

### 步驟 3: 啟動配置

創建 `.vscode/launch.json`：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch MCP MySQL Server",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/dist/index.js",
            "cwd": "${workspaceFolder}",
            "envFile": "${workspaceFolder}/.env",
            "console": "integratedTerminal"
        }
    ]
}
```

## 方法 4: 使用 VS Code 擴展 API（開發者）

如果您想開發自己的 VS Code 擴展來集成 MCP：

### package.json 配置

```json
{
  "contributes": {
    "configuration": {
      "title": "MCP MySQL",
      "properties": {
        "mcpMySQL.serverPath": {
          "type": "string",
          "default": "./dist/index.js",
          "description": "Path to MCP MySQL server"
        }
      }
    },
    "commands": [
      {
        "command": "mcpMySQL.start",
        "title": "Start MCP MySQL Server"
      }
    ]
  }
}
```

## 通用設定檔案

無論使用哪種方法，都建議在專案中創建統一的配置檔案：

### `.vscode/settings.json`
```json
{
  "mcp.servers": {
    "mysql-database": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "${workspaceFolder}",
      "env": {
        "NODE_ENV": "development"
      }
    }
  },
  "terminal.integrated.env.osx": {
    "MCP_SERVER_PATH": "${workspaceFolder}/dist/index.js"
  }
}
```

### `.vscode/extensions.json` （推薦擴展）
```json
{
  "recommendations": [
    "anthropic.claude-dev",
    "ms-vscode.vscode-json"
  ]
}
```

## 使用方式

配置完成後：

1. **使用命令面板**：
   - Ctrl+Shift+P (Windows/Linux) 或 Cmd+Shift+P (macOS)
   - 輸入 "MCP" 或 "Claude" 相關命令

2. **使用側邊欄**：
   - 查找 MCP 或 Claude 相關的側邊欄面板

3. **使用快捷鍵**：
   - 根據擴展的配置使用相應快捷鍵

## 測試配置

1. 開啟 VS Code 終端
2. 執行：
   ```bash
   cd /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector
   npm run build
   node dist/index.js
   ```
3. 確認 MCP Server 正常啟動

## 疑難排解

### 常見問題

1. **路徑問題**：確保所有路徑都是絕對路徑或正確的相對路徑
2. **權限問題**：確保 node 和腳本有執行權限
3. **環境變量**：確保 .env 檔案在正確位置
4. **擴展版本**：確保使用最新版本的 MCP 相關擴展

### 調試方法

1. 檢查 VS Code 開發者控制台：
   - Help → Toggle Developer Tools

2. 查看輸出面板：
   - View → Output → 選擇相關擴展

3. 檢查終端輸出：
   - 確認 MCP Server 啟動訊息

## 注意事項

- 確保資料庫服務正在運行
- 檢查防火牆設定
- 定期更新相關擴展
- 注意安全設定，不要在配置中硬編碼敏感資訊