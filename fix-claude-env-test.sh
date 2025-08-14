#!/bin/bash

# 測試修復後的 Claude Desktop 配置

echo "🧪 測試 Claude Desktop 配置"
echo "=========================="

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 檢查配置檔案
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Claude Desktop 配置檔案不存在${NC}"
    exit 1
fi

echo -e "${BLUE}📋 檢查配置檔案格式...${NC}"

# 驗證 JSON 格式
if ! python3 -m json.tool "$CONFIG_FILE" > /dev/null 2>&1; then
    echo -e "${RED}❌ 配置檔案格式錯誤${NC}"
    exit 1
fi

echo -e "${GREEN}✅ JSON 格式正確${NC}"

# 檢查多資料庫環境變數
echo -e "${BLUE}📋 檢查多資料庫環境變數...${NC}"

if grep -q "DB_CONNECTIONS" "$CONFIG_FILE"; then
    echo -e "${GREEN}✅ 找到 DB_CONNECTIONS${NC}"
    
    if grep -q "DEFAULT_DB" "$CONFIG_FILE"; then
        echo -e "${GREEN}✅ 找到 DEFAULT_DB${NC}"
    else
        echo -e "${RED}❌ 缺少 DEFAULT_DB${NC}"
    fi
    
    # 檢查各連線的環境變數
    CONNECTIONS=$(grep -o '"DB_CONNECTIONS": "[^"]*"' "$CONFIG_FILE" | sed 's/.*": "\([^"]*\)".*/\1/')
    echo -e "${BLUE}   連線列表: $CONNECTIONS${NC}"
    
    IFS=',' read -ra CONN_ARRAY <<< "$CONNECTIONS"
    for conn in "${CONN_ARRAY[@]}"; do
        conn=$(echo "$conn" | xargs)
        CONN_UPPER=$(echo "$conn" | tr '[:lower:]' '[:upper:]')
        
        if grep -q "DB_${CONN_UPPER}_HOST" "$CONFIG_FILE"; then
            echo -e "${GREEN}   ✅ 連線 $conn 配置完整${NC}"
        else
            echo -e "${RED}   ❌ 連線 $conn 配置缺失${NC}"
        fi
    done
    
else
    echo -e "${YELLOW}📁 單資料庫模式${NC}"
    
    if grep -q "DB_HOST" "$CONFIG_FILE"; then
        echo -e "${GREEN}✅ 找到單資料庫配置${NC}"
    else
        echo -e "${RED}❌ 缺少資料庫配置${NC}"
    fi
fi

# 檢查 MCP 服務設定
echo -e "${BLUE}📋 檢查 MCP 服務設定...${NC}"

if grep -q "MCP_TRANSPORT_MODE" "$CONFIG_FILE"; then
    MODE=$(grep -o '"MCP_TRANSPORT_MODE": "[^"]*"' "$CONFIG_FILE" | sed 's/.*": "\([^"]*\)".*/\1/')
    echo -e "${GREEN}✅ 傳輸模式: $MODE${NC}"
    
    if [ "$MODE" = "http" ] || [ "$MODE" = "both" ]; then
        if grep -q "MCP_SERVER_PORT" "$CONFIG_FILE"; then
            PORT=$(grep -o '"MCP_SERVER_PORT": "[^"]*"' "$CONFIG_FILE" | sed 's/.*": "\([^"]*\)".*/\1/')
            echo -e "${GREEN}✅ HTTP 端口: $PORT${NC}"
        fi
        
        if grep -q "MCP_ENABLE_CORS" "$CONFIG_FILE"; then
            echo -e "${GREEN}✅ CORS 設定已配置${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  使用預設 stdio 模式${NC}"
fi

echo ""
echo -e "${GREEN}🎉 配置檢查完成！${NC}"
echo -e "${YELLOW}💡 建議測試步驟：${NC}"
echo -e "1. 重新啟動 Claude Desktop"
echo -e "2. 測試多資料庫連線功能"
echo -e "3. 如果使用 HTTP 模式，測試外網連入"