#!/bin/bash

# MCP Server 管理腳本

PID_FILE="mcp-server.pid"
LOG_FILE="mcp-server.log"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查 server 狀態
check_status() {
    echo -e "${BLUE}🔍 檢查 MCP Server 狀態...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ MCP Server 正在運行 (PID: $PID)${NC}"
            echo -e "${BLUE}📊 進程資訊:${NC}"
            ps -p $PID -o pid,ppid,cmd,%cpu,%mem,start
            return 0
        else
            echo -e "${RED}❌ PID $PID 不存在，清理 PID 檔案${NC}"
            rm -f $PID_FILE
        fi
    fi
    
    # 使用 pgrep 查找進程
    PIDS=$(pgrep -f "dist/index.js")
    if [ ! -z "$PIDS" ]; then
        echo -e "${YELLOW}⚠️ 找到 MCP Server 進程但沒有 PID 檔案:${NC}"
        for pid in $PIDS; do
            echo -e "${GREEN}  PID: $pid${NC}"
            ps -p $pid -o pid,ppid,cmd,%cpu,%mem,start
        done
        return 1
    fi
    
    echo -e "${RED}❌ MCP Server 未運行${NC}"
    return 2
}

# 啟動 server
start_server() {
    echo -e "${BLUE}🚀 啟動 MCP Server...${NC}"
    
    if check_status > /dev/null; then
        echo -e "${YELLOW}⚠️ MCP Server 已經在運行${NC}"
        return 1
    fi
    
    # 檢查 dist 目錄是否存在
    if [ ! -f "dist/index.js" ]; then
        echo -e "${RED}❌ dist/index.js 不存在，請先執行 npm run build${NC}"
        return 1
    fi
    
    # 啟動 server
    nohup node dist/index.js > $LOG_FILE 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > $PID_FILE
    
    # 等待一下確認啟動成功
    sleep 2
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MCP Server 已啟動 (PID: $SERVER_PID)${NC}"
        echo -e "${BLUE}📁 PID 檔案: $PID_FILE${NC}"
        echo -e "${BLUE}📋 日誌檔案: $LOG_FILE${NC}"
    else
        echo -e "${RED}❌ MCP Server 啟動失敗${NC}"
        rm -f $PID_FILE
        return 1
    fi
}

# 停止 server
stop_server() {
    echo -e "${BLUE}🛑 停止 MCP Server...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${BLUE}停止進程 $PID${NC}"
            kill -TERM $PID
            
            # 等待進程終止
            for i in {1..10}; do
                if ! ps -p $PID > /dev/null 2>&1; then
                    break
                fi
                echo -e "${YELLOW}等待進程終止... ($i/10)${NC}"
                sleep 1
            done
            
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️ 進程未響應，強制終止${NC}"
                kill -KILL $PID
            fi
            
            echo -e "${GREEN}✅ MCP Server 已停止${NC}"
        fi
        rm -f $PID_FILE
    else
        # 查找並停止所有相關進程
        PIDS=$(pgrep -f "dist/index.js")
        if [ ! -z "$PIDS" ]; then
            echo -e "${YELLOW}⚠️ 找到未管理的 MCP Server 進程，正在停止...${NC}"
            for pid in $PIDS; do
                echo -e "${BLUE}停止進程 $pid${NC}"
                kill -TERM $pid
            done
        else
            echo -e "${RED}❌ 沒有找到運行中的 MCP Server${NC}"
        fi
    fi
}

# 重啟 server
restart_server() {
    echo -e "${BLUE}🔄 重啟 MCP Server...${NC}"
    stop_server
    sleep 2
    start_server
}

# 查看日誌
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${BLUE}📋 MCP Server 日誌:${NC}"
        if [ "$1" = "-f" ]; then
            tail -f $LOG_FILE
        else
            tail -n 50 $LOG_FILE
        fi
    else
        echo -e "${RED}❌ 日誌檔案不存在${NC}"
    fi
}

# 顯示幫助
show_help() {
    echo -e "${BLUE}MCP MySQL Server 管理工具${NC}"
    echo ""
    echo "用法: $0 [command] [options]"
    echo ""
    echo "命令:"
    echo "  status          檢查 server 狀態"
    echo "  start           啟動 server"
    echo "  stop            停止 server"
    echo "  restart         重啟 server"
    echo "  logs            顯示最近的日誌"
    echo "  logs -f         實時查看日誌"
    echo "  help            顯示此幫助資訊"
    echo ""
    echo "範例:"
    echo "  $0 status       # 檢查狀態"
    echo "  $0 start        # 啟動 server"
    echo "  $0 logs -f      # 實時查看日誌"
}

# 主程式
case "$1" in
    status)
        check_status
        ;;
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    logs)
        show_logs $2
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${YELLOW}⚠️ 未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac