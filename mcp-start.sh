#!/bin/bash

# MCP Server 啟動腳本 - 載入 .env 檔案

# 切換到專案目錄
cd /Volumes/HF-iMac2015-Storage/Projects/AI/MCP/DBConnector

# 載入 .env 檔案
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# 啟動 MCP Server
exec node dist/index.js