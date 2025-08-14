#!/bin/bash

# 檢查 Claude Desktop MCP 配置狀態

echo "🔍 Claude Desktop MCP 配置檢查"
echo "==============================="

CLAUDE_CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
PROJECT_PATH="/Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector"

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""

# 檢查 1: 配置檔案是否存在
echo -e "${BLUE}1. 檢查配置檔案...${NC}"
if [ -f "$CLAUDE_CONFIG_FILE" ]; then
    echo -e "${GREEN}✅ 配置檔案存在${NC}"
else
    echo -e "${RED}❌ 配置檔案不存在: $CLAUDE_CONFIG_FILE${NC}"
    echo -e "${YELLOW}💡 請執行 ./setup-claude.sh 進行配置${NC}"
    exit 1
fi

# 檢查 2: JSON 格式
echo -e "${BLUE}2. 檢查 JSON 格式...${NC}"
if python3 -m json.tool "$CLAUDE_CONFIG_FILE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ JSON 格式正確${NC}"
else
    echo -e "${RED}❌ JSON 格式錯誤${NC}"
    exit 1
fi

# 檢查 3: MCP Server 配置
echo -e "${BLUE}3. 檢查 MCP Server 配置...${NC}"
if grep -q "mysql-database" "$CLAUDE_CONFIG_FILE"; then
    echo -e "${GREEN}✅ MySQL MCP Server 已配置${NC}"
else
    echo -e "${RED}❌ 未找到 MySQL MCP Server 配置${NC}"
    exit 1
fi

# 檢查 4: 檔案路徑
echo -e "${BLUE}4. 檢查檔案路徑...${NC}"
if [ -f "$PROJECT_PATH/dist/index.js" ]; then
    echo -e "${GREEN}✅ MCP Server 檔案存在${NC}"
else
    echo -e "${RED}❌ MCP Server 檔案不存在: $PROJECT_PATH/dist/index.js${NC}"
    echo -e "${YELLOW}💡 請執行: cd $PROJECT_PATH && npm run build${NC}"
    exit 1
fi

# 檢查 5: MCP Server 功能
echo -e "${BLUE}5. 測試 MCP Server 功能...${NC}"
cd "$PROJECT_PATH"
if npm run tools:test > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MCP Server 功能正常${NC}"
else
    echo -e "${YELLOW}⚠️ MCP Server 測試失敗（可能是資料庫連線問題）${NC}"
fi

# 檢查 6: Claude Desktop 是否運行
echo -e "${BLUE}6. 檢查 Claude Desktop 狀態...${NC}"
if pgrep -x "Claude" > /dev/null; then
    echo -e "${GREEN}✅ Claude Desktop 正在運行${NC}"
else
    echo -e "${YELLOW}⚠️ Claude Desktop 未運行${NC}"
    echo -e "${YELLOW}💡 請啟動 Claude Desktop 以使用 MCP Server${NC}"
fi

# 顯示配置摘要
echo ""
echo -e "${BLUE}📋 配置摘要:${NC}"
echo -e "${BLUE}配置檔案:${NC} $CLAUDE_CONFIG_FILE"
echo -e "${BLUE}專案路徑:${NC} $PROJECT_PATH"
echo ""

# 顯示配置內容
echo -e "${BLUE}📄 當前配置:${NC}"
python3 -m json.tool "$CLAUDE_CONFIG_FILE"
echo ""

echo -e "${GREEN}🎉 配置檢查完成！${NC}"
echo ""
echo -e "${YELLOW}💬 在 Claude Desktop 中測試這些指令:${NC}"
echo -e "   • 請列出您可用的資料庫工具"
echo -e "   • 請測試資料庫連線"
echo -e "   • 請列出資料庫中的所有資料表"
echo -e "   • 請執行查詢：SELECT COUNT(*) FROM users"