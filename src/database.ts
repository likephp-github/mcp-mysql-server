import mysql from 'mysql2/promise';
import { dbConfig, type DatabaseConfig } from './config.js';

export class DatabaseManager {
  private pools: Record<string, mysql.Pool> = {};

  constructor() {
    this.initializePools();
  }

  private initializePools() {
    for (const [name, config] of Object.entries(dbConfig.connections)) {
      const poolConfig: mysql.PoolOptions = {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        connectionLimit: dbConfig.connectionLimit,
        connectTimeout: dbConfig.timeout,
        multipleStatements: false
      };

      // 明確處理 SSL 配置
      if (config.ssl) {
        poolConfig.ssl = {};
      } else {
        poolConfig.ssl = undefined;
      }

      this.pools[name] = mysql.createPool(poolConfig);
    }
  }

  private getPool(connectionName?: string): mysql.Pool {
    const name = connectionName || dbConfig.defaultConnection;
    const pool = this.pools[name];
    
    if (!pool) {
      throw new Error(`Database connection '${name}' not found. Available connections: ${Object.keys(this.pools).join(', ')}`);
    }
    
    return pool;
  }

  getAvailableConnections(): string[] {
    return Object.keys(this.pools);
  }

  getDefaultConnection(): string {
    return dbConfig.defaultConnection;
  }

  getConnectionInfo(connectionName?: string): DatabaseConfig {
    const name = connectionName || dbConfig.defaultConnection;
    const config = dbConfig.connections[name];
    
    if (!config) {
      throw new Error(`Database connection '${name}' not found`);
    }
    
    // 返回不包含密碼的配置資訊
    return {
      ...config,
      password: '[隱藏]'
    };
  }

  async query(sql: string, params: any[] = [], connectionName?: string): Promise<any> {
    try {
      const pool = this.getPool(connectionName);
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error(`Database query error (${connectionName || dbConfig.defaultConnection}):`, error);
      throw error;
    }
  }

  async getTableSchema(tableName: string, connectionName?: string): Promise<any[]> {
    // 為了安全，先驗證表名格式
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      throw new Error('Invalid table name format');
    }
    const sql = `DESCRIBE \`${tableName}\``;
    return await this.query(sql, [], connectionName);
  }

  async listTables(connectionName?: string): Promise<string[]> {
    const sql = 'SHOW TABLES';
    const results = await this.query(sql, [], connectionName);
    
    if (results.length === 0) {
      return [];
    }
    
    const tableKey = Object.keys(results[0])[0];
    return results.map((row: any) => row[tableKey]);
  }

  async testConnection(connectionName?: string): Promise<boolean> {
    try {
      await this.query('SELECT 1', [], connectionName);
      return true;
    } catch (error) {
      console.error(`Connection test failed (${connectionName || dbConfig.defaultConnection}):`, error);
      return false;
    }
  }

  async testAllConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const connectionName of this.getAvailableConnections()) {
      results[connectionName] = await this.testConnection(connectionName);
    }
    
    return results;
  }

  async close(): Promise<void> {
    const closePromises = Object.values(this.pools).map(pool => pool.end());
    await Promise.all(closePromises);
  }
}

// 向下兼容的 DatabaseConnection 類別
export class DatabaseConnection extends DatabaseManager {
  constructor() {
    super();
  }
}