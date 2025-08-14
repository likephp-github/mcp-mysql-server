#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🔍 檢查 MCP MySQL Server 狀態...\n');

// 使用 pgrep 查找進程（更可靠）
const pgrepProcess = spawn('pgrep', ['-f', 'dist/index.js']);
let pids = '';

pgrepProcess.stdout.on('data', (data) => {
  pids += data.toString();
});

pgrepProcess.on('close', (code) => {
  if (code === 0 && pids.trim()) {
    const pidList = pids.trim().split('\n');
    console.log('✅ MCP Server 正在運行:');
    pidList.forEach(pid => {
      console.log(`   PID: ${pid}`);
    });
    
    // 顯示詳細資訊
    const psProcess = spawn('ps', ['-p', pidList.join(','), '-o', 'pid,ppid,%cpu,%mem,start,command']);
    psProcess.stdout.on('data', (data) => {
      console.log('\n📊 進程詳情:');
      console.log(data.toString());
    });
  } else {
    console.log('❌ MCP Server 未運行');
    console.log('\n💡 啟動方法:');
    console.log('   npm run build && npm start');
    console.log('   或');
    console.log('   npm run server:start');
  }
});

pgrepProcess.on('error', (error) => {
  console.log('⚠️ 無法執行 pgrep 命令，使用 ps 替代...');
  
  // 備用方法：使用 ps aux
  const psProcess = spawn('ps', ['aux']);
  let output = '';
  
  psProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  psProcess.on('close', () => {
    const lines = output.split('\n');
    const mcpProcesses = lines.filter(line => 
      line.includes('node') && line.includes('dist/index.js')
    );
    
    if (mcpProcesses.length > 0) {
      console.log('✅ 找到 MCP Server 進程:');
      mcpProcesses.forEach(process => {
        const parts = process.trim().split(/\s+/);
        const pid = parts[1];
        console.log(`   PID: ${pid}`);
      });
    } else {
      console.log('❌ 未找到 MCP Server 進程');
    }
  });
});