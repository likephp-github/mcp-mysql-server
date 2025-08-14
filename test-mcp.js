#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.responses = new Map();
    this.currentId = 1;
  }

  async startServer() {
    console.log('🚀 啟動 MCP Server...');
    
    this.serverProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.serverProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message.includes('running on stdio')) {
        console.log('✅ Server 已啟動');
      }
    });

    this.serverProcess.on('error', (error) => {
      console.error('❌ Server 錯誤:', error.message);
    });

    // 處理響應
    const rl = createInterface({
      input: this.serverProcess.stdout,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          if (response.id && this.responses.has(response.id)) {
            const resolver = this.responses.get(response.id);
            this.responses.delete(response.id);
            resolver(response);
          }
        } catch (e) {
          // 忽略非 JSON 行
        }
      }
    });

    // 等待 server 啟動
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async sendRequest(method, params = {}) {
    const id = this.currentId++;
    const request = {
      jsonrpc: '2.0',
      id: id,
      method: method,
      params: params
    };

    console.log(`📤 發送: ${method}`);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responses.delete(id);
        reject(new Error('請求超時 (10秒)'));
      }, 10000);

      this.responses.set(id, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testTool(toolName, args = {}) {
    try {
      const response = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: args
      });

      console.log(`📨 響應 (${toolName}):`);
      if (response.result) {
        if (response.result.content) {
          response.result.content.forEach(content => {
            console.log(`   ${content.text}`);
          });
        } else {
          console.log(`   ${JSON.stringify(response.result, null, 2)}`);
        }
        return true;
      } else if (response.error) {
        console.log(`❌ 錯誤: ${response.error.message}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 測試失敗: ${error.message}`);
      return false;
    }
  }

  async listTools() {
    try {
      const response = await this.sendRequest('tools/list');
      
      if (response.result && response.result.tools) {
        console.log('📋 可用工具:');
        response.result.tools.forEach((tool, index) => {
          console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
        });
        return true;
      } else {
        console.log('❌ 獲取工具列表失敗');
        return false;
      }
    } catch (error) {
      console.log(`❌ 列表工具失敗: ${error.message}`);
      return false;
    }
  }

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
    }
  }
}

// 主程式
async function main() {
  const tester = new MCPTester();
  
  process.on('SIGINT', () => {
    console.log('\n🔄 清理並退出...');
    tester.cleanup();
    process.exit(0);
  });

  try {
    await tester.startServer();

    const command = process.argv[2];
    let success = false;

    switch (command) {
      case 'list':
        success = await tester.listTools();
        break;
        
      case 'test':
        success = await tester.testTool('test_connection');
        break;
        
      case 'tables':
        success = await tester.testTool('list_tables');
        break;
        
      case 'describe':
        const tableName = process.argv[3];
        if (!tableName) {
          console.log('❌ 請提供資料表名稱: node test-mcp.js describe <table_name>');
          success = false;
        } else {
          success = await tester.testTool('describe_table', { table_name: tableName });
        }
        break;
        
      case 'query':
        const sql = process.argv[3];
        if (!sql) {
          console.log('❌ 請提供 SQL 查詢: node test-mcp.js query "<sql>"');
          success = false;
        } else {
          success = await tester.testTool('execute_query', { query: sql });
        }
        break;

      case 'connections':
        success = await tester.testTool('list_connections');
        break;

      case 'test-all':
        success = await tester.testTool('test_all_connections');
        break;

      case 'all':
        console.log('🧪 執行完整測試套件...\n');
        
        console.log('1️⃣ 測試工具列表:');
        success = await tester.listTools();
        console.log('');

        console.log('2️⃣ 測試連線列表:');
        success = await tester.testTool('list_connections') && success;
        console.log('');

        console.log('3️⃣ 測試所有資料庫連線:');
        success = await tester.testTool('test_all_connections') && success;
        console.log('');

        console.log('4️⃣ 測試列出資料表:');
        success = await tester.testTool('list_tables') && success;
        console.log('');

        console.log('5️⃣ 測試在 0 連線列出資料表:');
        success = await tester.testTool('list_tables', { connection: '0' }) && success;
        console.log('');

        console.log('6️⃣ 測試查詢 (預設連線):');
        success = await tester.testTool('execute_query', { query: 'SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE()' }) && success;
        console.log('');

        console.log('7️⃣ 測試查詢 (指定 0 連線):');
        success = await tester.testTool('execute_query', { query: 'SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = DATABASE()', connection: '0' }) && success;
        console.log('');
        break;
        
      default:
        console.log('🚀 MCP MySQL Server 測試工具');
        console.log('');
        console.log('用法:');
        console.log('  node test-mcp.js list                    # 列出工具');
        console.log('  node test-mcp.js test                    # 測試連線');
        console.log('  node test-mcp.js tables                  # 列出資料表');
        console.log('  node test-mcp.js describe <table>        # 查看表結構');
        console.log('  node test-mcp.js query "<sql>"           # 執行查詢');
        console.log('  node test-mcp.js all                     # 執行完整測試');
        console.log('  node test-mcp.js connections             # 列出連線');
        console.log('  node test-mcp.js test-all                # 測試所有連線');
        console.log('');
        success = true;
    }

    console.log(success ? '\n✅ 測試完成' : '\n❌ 測試失敗');
    
  } catch (error) {
    console.error('❌ 測試器錯誤:', error.message);
  } finally {
    tester.cleanup();
    process.exit(0);
  }
}

if (process.argv[1].endsWith('test-mcp.js')) {
  main();
}