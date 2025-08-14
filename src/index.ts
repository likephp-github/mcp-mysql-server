#!/usr/bin/env node

import { MCPDatabaseServer } from './server.js';
import { MCPDatabaseHTTPServer } from './http-server.js';
import { serverConfig } from './config.js';

async function main() {
  console.error(`🔧 Transport mode: ${serverConfig.transportMode}`);
  
  if (serverConfig.transportMode === 'stdio') {
    // 原有的 stdio 模式
    const server = new MCPDatabaseServer();

    process.on('SIGINT', async () => {
      console.error('Shutting down server...');
      await server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Shutting down server...');
      await server.close();
      process.exit(0);
    });

    try {
      await server.run();
    } catch (error) {
      console.error('Server error:', error);
      await server.close();
      process.exit(1);
    }
    
  } else if (serverConfig.transportMode === 'http') {
    // HTTP 模式
    const httpServer = new MCPDatabaseHTTPServer(serverConfig);

    process.on('SIGINT', async () => {
      console.error('Shutting down HTTP server...');
      await httpServer.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Shutting down HTTP server...');
      await httpServer.close();
      process.exit(0);
    });

    try {
      await httpServer.run();
    } catch (error) {
      console.error('HTTP Server error:', error);
      await httpServer.close();
      process.exit(1);
    }
    
  } else if (serverConfig.transportMode === 'both') {
    // 同時運行兩種模式
    const stdioServer = new MCPDatabaseServer();
    const httpServer = new MCPDatabaseHTTPServer(serverConfig);

    process.on('SIGINT', async () => {
      console.error('Shutting down both servers...');
      await Promise.all([stdioServer.close(), httpServer.close()]);
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('Shutting down both servers...');
      await Promise.all([stdioServer.close(), httpServer.close()]);
      process.exit(0);
    });

    try {
      await Promise.all([stdioServer.run(), httpServer.run()]);
    } catch (error) {
      console.error('Server error:', error);
      await Promise.all([stdioServer.close(), httpServer.close()]);
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});