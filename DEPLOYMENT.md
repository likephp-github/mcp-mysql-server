# MCP MySQL Server 外網部署指南

## 🌐 外網部署配置

您的 MCP Server 現在支援三種運行模式：

### 📋 配置模式

1. **stdio** (預設) - 本地 Claude 桌面應用使用
2. **http** - 外網 HTTP 訪問模式
3. **both** - 同時支援兩種模式

### 🔧 環境變數配置

複製 `.env.http-example` 為 `.env` 並修改配置：

```bash
cp .env.http-example .env
```

#### 重要配置說明：

- `MCP_TRANSPORT_MODE=http` - 啟用 HTTP 模式
- `MCP_SERVER_HOST=0.0.0.0` - 綁定所有網路介面 (允許外部訪問)
- `MCP_SERVER_PORT=3000` - HTTP 服務端口
- `MCP_ALLOWED_ORIGINS=*` - CORS 設定 (生產環境建議限制特定域名)
- `MCP_API_KEY=your_secret_key` - 可選的 API 密鑰保護

### 🚀 啟動服務

```bash
# 建置專案
npm run build

# HTTP 模式啟動
npm run start:http

# 或開發模式
npm run dev:http

# 同時啟動兩種模式
npm run start:both
```

### 🔒 安全性考慮

#### 1. API 密鑰驗證
```bash
# 設置 API 密鑰
MCP_API_KEY=your_strong_secret_key_here
```

使用時在請求標頭或查詢參數中包含：
```
Authorization: Bearer your_strong_secret_key_here
# 或
GET /mcp?api_key=your_strong_secret_key_here
```

#### 2. CORS 設定
```bash
# 生產環境建議限制特定域名
MCP_ALLOWED_ORIGINS=https://claude.ai,https://your-app.com

# 開發環境可使用通配符
MCP_ALLOWED_ORIGINS=*
```

#### 3. 防火牆設定
確保只開放必要的端口：
```bash
# 例如：開放 3000 端口
sudo ufw allow 3000/tcp
```

### 🌍 外網訪問端點

服務啟動後，外部可以通過以下端點訪問：

- **健康檢查**: `http://your-server-ip:3000/health`
- **MCP 端點**: `http://your-server-ip:3000/mcp`
- **API 資訊**: `http://your-server-ip:3000/api/info`

### 🔧 反向代理設定 (推薦)

#### Nginx 配置範例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### SSL/HTTPS 設定：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        # ... 其他配置同上
    }
}
```

### 📊 監控和日誌

服務會輸出詳細的啟動資訊：

```
🚀 MySQL MCP Server running on http://0.0.0.0:3000
📊 Health check: http://0.0.0.0:3000/health
🔗 MCP endpoint: http://0.0.0.0:3000/mcp
📖 API info: http://0.0.0.0:3000/api/info
🔒 CORS允許的來源: https://claude.ai
🔐 API密鑰驗證已啟用
```

### 🧪 測試外網連接

```bash
# 健康檢查
curl http://your-server-ip:3000/health

# API 資訊
curl http://your-server-ip:3000/api/info

# 使用 API 密鑰的請求
curl -H "Authorization: Bearer your_api_key" http://your-server-ip:3000/mcp
```

### 🐳 Docker 部署 (可選)

您也可以使用 Docker 容器化部署：

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY .env ./

EXPOSE 3000

CMD ["npm", "run", "start:http"]
```

### ⚠️ 注意事項

1. **資料庫安全**: 確保資料庫連接使用強密碼和適當的權限
2. **網路安全**: 考慮使用 VPN 或專用網路連接
3. **日誌監控**: 定期檢查訪問日誌和錯誤日誌
4. **更新維護**: 定期更新依賴包和安全補丁
5. **備份策略**: 實施適當的資料備份策略

### 🔄 從 stdio 模式遷移

如果您之前使用 stdio 模式，無需修改 Claude 配置文件。只需：

1. 設置 `MCP_TRANSPORT_MODE=both` 同時支援兩種模式
2. 或保持 stdio 模式用於本地，另外啟動 HTTP 服務用於外網

這樣可以確保向下相容性。
