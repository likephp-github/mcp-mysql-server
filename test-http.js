#!/usr/bin/env node

// HTTP 模式測試腳本
const SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.MCP_API_KEY;

async function testEndpoints() {
  console.log('🧪 Testing MCP HTTP Server endpoints...\n');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
  };

  try {
    // 測試健康檢查
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // 測試 API 資訊
    console.log('2. Testing API info endpoint...');
    const infoResponse = await fetch(`${SERVER_URL}/api/info`);
    const infoData = await infoResponse.json();
    console.log('✅ API info:', infoData);
    console.log('');

    // 測試 MCP 端點可達性 (SSE)
    console.log('3. Testing MCP endpoint accessibility...');
    const mcpResponse = await fetch(`${SERVER_URL}/mcp`, {
      headers: {
        'Accept': 'text/event-stream',
        ...headers
      }
    });
    
    if (mcpResponse.ok) {
      console.log('✅ MCP endpoint is accessible');
      console.log('   Status:', mcpResponse.status);
      console.log('   Content-Type:', mcpResponse.headers.get('content-type'));
    } else {
      console.log('❌ MCP endpoint error:', mcpResponse.status, mcpResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the MCP HTTP server is running:');
    console.log('   npm run start:http');
    console.log('   or');
    console.log('   MCP_TRANSPORT_MODE=http npm run dev');
  }
}

// 檢查是否在 Node.js 環境中有 fetch
if (typeof fetch === 'undefined') {
  console.log('Installing node-fetch for testing...');
  import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
    testEndpoints();
  }).catch(() => {
    console.log('❌ Please install node-fetch for testing:');
    console.log('   npm install node-fetch');
  });
} else {
  testEndpoints();
}
