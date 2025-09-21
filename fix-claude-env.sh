#!/bin/bash

# 修復 Claude Desktop 環境變數問題 - 多資料庫連線版本

echo "🔧 修復 Claude Desktop 環境變數載入問題 (多資料庫支援)"
echo "============================================"

CLAUDE_CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
ENV_FILE="/Users/mat/Documents/html/mcp-mysql-server/.env"
PROJECT_PATH="/Users/mat/Documents/html/mcp-mysql-server"

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 檢查 .env 檔案是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env 檔案不存在: $ENV_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}📋 讀取 .env 檔案...${NC}"

# 安全讀取 .env 檔案，避免特殊字符問題
read_env_file() {
    while IFS= read -r line; do
        # 跳過註釋和空行
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
            continue
        fi
        
        # 解析 KEY=VALUE 或 KEY="VALUE"
        if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # 移除值周圍的引號
            if [[ $value =~ ^\"(.*)\"$ ]]; then
                value="${BASH_REMATCH[1]}"
            elif [[ $value =~ ^\'(.*)\'$ ]]; then
                value="${BASH_REMATCH[1]}"
            fi
            
            # 安全地設置環境變數
            export "$key=$value"
            echo -e "${BLUE}   讀取: $key${NC}"
        fi
    done < "$ENV_FILE"
}

read_env_file

# 檢測配置模式
if [ -n "$DB_CONNECTIONS" ]; then
    echo -e "${PURPLE}🗃️ 檢測到多資料庫配置${NC}"
    CONFIG_MODE="multi"
    
    # 檢查多資料庫必要變數
    if [ -z "$DEFAULT_DB" ]; then
        echo -e "${RED}❌ 多資料庫配置缺少 DEFAULT_DB${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 多資料庫配置讀取成功${NC}"
    echo -e "${BLUE}   連線列表: $DB_CONNECTIONS${NC}"
    echo -e "${BLUE}   預設連線: $DEFAULT_DB${NC}"
else
    echo -e "${YELLOW}📁 使用單資料庫配置 (向下兼容)${NC}"
    CONFIG_MODE="single"
    
    # 檢查單資料庫必要變數
    if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        echo -e "${RED}❌ 單資料庫配置缺少必要環境變數${NC}"
        echo -e "${YELLOW}請確保 .env 檔案包含: DB_USER, DB_PASSWORD, DB_NAME${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 單資料庫配置讀取成功${NC}"
fi

# 備份配置檔案
if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    cp "$CLAUDE_CONFIG_FILE" "$CLAUDE_CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✅ 配置檔案已備份${NC}"
fi

# 生成配置檔案的函數
generate_config() {
    if [ "$CONFIG_MODE" = "multi" ]; then
        echo -e "${PURPLE}📝 生成多資料庫配置...${NC}"
        
        # 開始構建 JSON
        cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["$PROJECT_PATH/dist/index.js"],
      "cwd": "$PROJECT_PATH",
      "env": {
        "DB_CONNECTIONS": "$DB_CONNECTIONS",
        "DEFAULT_DB": "$DEFAULT_DB",
EOF
        
        # 為每個連線添加環境變數
        IFS=',' read -ra CONN_ARRAY <<< "$DB_CONNECTIONS"
        for conn in "${CONN_ARRAY[@]}"; do
            conn=$(echo "$conn" | xargs)  # 移除空格
            CONN_UPPER=$(echo "$conn" | tr '[:lower:]' '[:upper:]')
            
            echo -e "${BLUE}   添加連線: $conn${NC}"
            
            # 動態讀取環境變數
            HOST_VAR="DB_${CONN_UPPER}_HOST"
            PORT_VAR="DB_${CONN_UPPER}_PORT"
            USER_VAR="DB_${CONN_UPPER}_USER"
            PASS_VAR="DB_${CONN_UPPER}_PASSWORD"
            NAME_VAR="DB_${CONN_UPPER}_NAME"
            SSL_VAR="DB_${CONN_UPPER}_SSL"
            
            HOST_VAL="${!HOST_VAR:-127.0.0.1}"
            PORT_VAL="${!PORT_VAR:-3306}"
            USER_VAL="${!USER_VAR}"
            PASS_VAL="${!PASS_VAR}"
            NAME_VAL="${!NAME_VAR}"
            SSL_VAL="${!SSL_VAR:-false}"
            
            # 添加到配置檔案
            cat >> "$CLAUDE_CONFIG_FILE" << EOF
        "DB_${CONN_UPPER}_HOST": "$HOST_VAL",
        "DB_${CONN_UPPER}_PORT": "$PORT_VAL",
        "DB_${CONN_UPPER}_USER": "$USER_VAL",
        "DB_${CONN_UPPER}_PASSWORD": "$PASS_VAL",
        "DB_${CONN_UPPER}_NAME": "$NAME_VAL",
        "DB_${CONN_UPPER}_SSL": "$SSL_VAL",
EOF
        done
        
        # 添加共用設定和結尾
        cat >> "$CLAUDE_CONFIG_FILE" << EOF
        "DB_CONNECTION_LIMIT": "${DB_CONNECTION_LIMIT:-10}",
        "DB_TIMEOUT": "${DB_TIMEOUT:-60000}",
        "MCP_TRANSPORT_MODE": "${MCP_TRANSPORT_MODE:-stdio}",
        "MCP_SERVER_PORT": "${MCP_SERVER_PORT:-3000}",
        "MCP_SERVER_HOST": "${MCP_SERVER_HOST:-0.0.0.0}",
        "MCP_ALLOWED_ORIGINS": "${MCP_ALLOWED_ORIGINS:-*}",
        "MCP_ENABLE_CORS": "${MCP_ENABLE_CORS:-true}"
      }
    }
  }
}
EOF
        
    else
        echo -e "${YELLOW}📝 生成單資料庫配置...${NC}"
        
        cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "mysql-database": {
      "command": "node",
      "args": ["$PROJECT_PATH/dist/index.js"],
      "cwd": "$PROJECT_PATH",
      "env": {
        "DB_HOST": "${DB_HOST:-127.0.0.1}",
        "DB_PORT": "${DB_PORT:-3306}",
        "DB_USER": "$DB_USER",
        "DB_PASSWORD": "$DB_PASSWORD",
        "DB_NAME": "$DB_NAME",
        "DB_SSL": "${DB_SSL:-false}",
        "DB_CONNECTION_LIMIT": "${DB_CONNECTION_LIMIT:-10}",
        "DB_TIMEOUT": "${DB_TIMEOUT:-60000}",
        "MCP_TRANSPORT_MODE": "${MCP_TRANSPORT_MODE:-stdio}",
        "MCP_SERVER_PORT": "${MCP_SERVER_PORT:-3000}",
        "MCP_SERVER_HOST": "${MCP_SERVER_HOST:-0.0.0.0}",
        "MCP_ALLOWED_ORIGINS": "${MCP_ALLOWED_ORIGINS:-*}",
        "MCP_ENABLE_CORS": "${MCP_ENABLE_CORS:-true}"
      }
    }
  }
}
EOF
    fi
}

# 生成配置
generate_config

# 驗證 JSON 格式
if python3 -m json.tool "$CLAUDE_CONFIG_FILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 配置檔案已更新${NC}"
else
    echo -e "${RED}❌ 配置檔案格式錯誤${NC}"
    exit 1
fi

# 顯示配置（隱藏密碼）
echo -e "${BLUE}📋 新的配置內容:${NC}"
if [ "$CONFIG_MODE" = "multi" ]; then
    cat "$CLAUDE_CONFIG_FILE" | sed 's/"DB_[^"]*_PASSWORD": "[^"]*"/"PASSWORD": "[隱藏]"/g'
else
    cat "$CLAUDE_CONFIG_FILE" | sed 's/"DB_PASSWORD": "[^"]*"/"DB_PASSWORD": "[隱藏]"/g'
fi

echo ""
echo -e "${GREEN}🎉 修復完成！${NC}"
echo -e "${YELLOW}📝 配置摘要:${NC}"

if [ "$CONFIG_MODE" = "multi" ]; then
    echo -e "${PURPLE}🗃️ 多資料庫模式${NC}"
    echo -e "   連線數量: $(echo "$DB_CONNECTIONS" | tr ',' '\n' | wc -l | xargs)"
    echo -e "   連線列表: $DB_CONNECTIONS"
    echo -e "   預設連線: $DEFAULT_DB"
    echo -e "   傳輸模式: ${MCP_TRANSPORT_MODE:-stdio}"
    if [ "$MCP_TRANSPORT_MODE" = "http" ] || [ "$MCP_TRANSPORT_MODE" = "both" ]; then
        echo -e "   HTTP 服務: ${MCP_SERVER_HOST:-0.0.0.0}:${MCP_SERVER_PORT:-3000}"
    fi
else
    echo -e "${YELLOW}📁 單資料庫模式${NC}"
    echo -e "   主機: ${DB_HOST:-127.0.0.1}:${DB_PORT:-3306}"
    echo -e "   資料庫: $DB_NAME"
    echo -e "   傳輸模式: ${MCP_TRANSPORT_MODE:-stdio}"
fi

echo ""
echo -e "${YELLOW}📝 接下來的步驟:${NC}"
echo -e "1. ${BLUE}重新啟動 Claude Desktop${NC}"
echo -e "2. ${BLUE}測試資料庫工具是否正常工作${NC}"
if [ "$MCP_TRANSPORT_MODE" = "http" ] || [ "$MCP_TRANSPORT_MODE" = "both" ]; then
    echo -e "3. ${PURPLE}外網連入測試: curl http://localhost:${MCP_SERVER_PORT:-3000}/health${NC}"
fi
echo -e "${GREEN}✨ 支援多資料庫和外網連入功能！${NC}"

# 詢問是否要打開 Claude Desktop
read -p "是否要現在打開 Claude Desktop？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 正在啟動 Claude Desktop...${NC}"
    open -a "Claude"
fi
