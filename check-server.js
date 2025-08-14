#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import path from 'path';

const PID_FILE = path.join(process.cwd(), 'mcp-server.pid');

function checkServerStatus() {
  console.log('🔍 檢查 MCP Server 狀態...\n');

  // 方法 1: 檢查 PID 檔案
  if (existsSync(PID_FILE)) {
    try {
      const pid = parseInt(readFileSync(PID_FILE, 'utf8').trim());
      console.log(`📁 找到 PID 檔案: ${pid}`);
      
      // 檢查進程是否還在運行
      try {
        process.kill(pid, 0); // 發送信號 0 不會殺死進程，只是檢查是否存在
        console.log(`✅ MCP Server 正在運行 (PID: ${pid})`);
        return { running: true, pid: pid, method: 'pidfile' };
      } catch (error) {
        console.log(`❌ PID ${pid} 不存在，清理 PID 檔案`);
        unlinkSync(PID_FILE);
      }
    } catch (error) {
      console.log(`❌ 無法讀取 PID 檔案: ${error.message}`);
    }
  }

  // 方法 2: 使用 ps 命令查找進程
  console.log('🔍 使用 ps 命令搜尋進程...');
  
  const psCommand = spawn('ps', ['aux'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '';

  psCommand.stdout.on('data', (data) => {
    output += data.toString();
  });

  psCommand.on('close', (code) => {
    const lines = output.split('\n');
    const mcpProcesses = lines.filter(line => 
      line.includes('node') && 
      (line.includes('dist/index.js') || line.includes('mcp-mysql-server'))
    );

    if (mcpProcesses.length > 0) {
      console.log(`✅ 找到 ${mcpProcesses.length} 個 MCP Server 進程:`);
      mcpProcesses.forEach(process => {
        const parts = process.trim().split(/\s+/);
        const pid = parts[1];
        console.log(`   PID: ${pid} - ${process.substring(0, 100)}...`);
      });
      return { running: true, processes: mcpProcesses, method: 'ps' };
    } else {
      console.log('❌ 未找到 MCP Server 進程');
      return { running: false, method: 'ps' };
    }
  });

  // 方法 3: 檢查端口 (如果有的話)
  setTimeout(() => {
    console.log('\n📊 進程檢查完成');
  }, 1000);
}

// 額外功能：啟動/停止 server
function startServer() {
  console.log('🚀 啟動 MCP Server...');
  
  const serverProcess = spawn('node', ['dist/index.js'], {
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore']
  });

  // 保存 PID
  writeFileSync(PID_FILE, serverProcess.pid.toString());
  serverProcess.unref();
  
  console.log(`✅ MCP Server 已啟動 (PID: ${serverProcess.pid})`);
  console.log(`📁 PID 已保存到: ${PID_FILE}`);
}

function stopServer() {
  if (!existsSync(PID_FILE)) {
    console.log('❌ 未找到 PID 檔案，Server 可能未運行');
    return;
  }

  try {
    const pid = parseInt(readFileSync(PID_FILE, 'utf8').trim());
    console.log(`🛑 停止 MCP Server (PID: ${pid})...`);
    
    process.kill(pid, 'SIGTERM');
    unlinkSync(PID_FILE);
    
    console.log('✅ MCP Server 已停止');
  } catch (error) {
    console.log(`❌ 停止 Server 失敗: ${error.message}`);
  }
}

// 命令行參數處理
const command = process.argv[2];

switch (command) {
  case 'start':
    startServer();
    break;
  case 'stop':
    stopServer();
    break;
  case 'restart':
    stopServer();
    setTimeout(() => startServer(), 1000);
    break;
  case 'status':
  default:
    checkServerStatus();
    break;
}