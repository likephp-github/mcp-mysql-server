import { config } from 'dotenv';
import { z } from 'zod';

config();

// 網路伺服器配置 Schema
const ServerConfigSchema = z.object({
  MCP_SERVER_PORT: z.coerce.number().default(3000),
  MCP_SERVER_HOST: z.string().default('0.0.0.0'),
  MCP_ALLOWED_ORIGINS: z.string().default('*'),
  MCP_TRANSPORT_MODE: z.enum(['stdio', 'http', 'both']).default('stdio'),
  MCP_API_KEY: z.string().optional(),
  MCP_ENABLE_CORS: z.string().transform(val => val.toLowerCase() === 'true').default('true')
});

// 單資料庫配置 Schema (向下兼容)
const SingleDBSchema = z.object({
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z.string().transform(val => val.toLowerCase() === 'true').default('false'),
  DB_CONNECTION_LIMIT: z.coerce.number().default(10),
  DB_TIMEOUT: z.coerce.number().default(60000)
});

// 資料庫連線配置 Schema
const DatabaseConfigSchema = z.object({
  host: z.string(),
  port: z.number(),
  user: z.string(),
  password: z.string(),
  database: z.string(),
  ssl: z.boolean()
});

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean;
}

export interface ServerConfig {
  port: number;
  host: string;
  allowedOrigins: string[];
  transportMode: 'stdio' | 'http' | 'both';
  apiKey?: string;
  enableCors: boolean;
}

export interface MultiDatabaseConfig {
  connections: Record<string, DatabaseConfig>;
  defaultConnection: string;
  connectionLimit: number;
  timeout: number;
}

function parseMultiDatabaseConfig(): MultiDatabaseConfig | null {
  const connections = process.env.DB_CONNECTIONS;
  if (!connections) return null;

  const connectionNames = connections.split(',').map(name => name.trim());
  const parsedConnections: Record<string, DatabaseConfig> = {};

  try {
    for (const name of connectionNames) {
      const prefix = `DB_${name.toUpperCase()}_`;
      const config = {
        host: process.env[`${prefix}HOST`] || '127.0.0.1',
        port: parseInt(process.env[`${prefix}PORT`] || '3306'),
        user: process.env[`${prefix}USER`],
        password: process.env[`${prefix}PASSWORD`],
        database: process.env[`${prefix}NAME`],
        ssl: process.env[`${prefix}SSL`]?.toLowerCase() === 'true'
      };

      if (!config.user || !config.password || !config.database) {
        const missing = [];
        if (!config.user) missing.push('user');
        if (!config.password) missing.push('password');
        if (!config.database) missing.push('database');

        throw new Error(
          `Missing required configuration for database connection '${name}': ${missing.join(', ')}.\n` +
          `Please set the following environment variables in your .env file:\n` +
          (!config.user ? `  DB_${name.toUpperCase()}_USER=your_username\n` : '') +
          (!config.password ? `  DB_${name.toUpperCase()}_PASSWORD=your_password\n` : '') +
          (!config.database ? `  DB_${name.toUpperCase()}_NAME=your_database_name\n` : '')
        );
      }

      parsedConnections[name] = DatabaseConfigSchema.parse(config);
    }

    const defaultConnection = process.env.DEFAULT_DB || connectionNames[0];
    if (!parsedConnections[defaultConnection]) {
      throw new Error(`Default database connection '${defaultConnection}' not found in available connections`);
    }

    return {
      connections: parsedConnections,
      defaultConnection,
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
      timeout: parseInt(process.env.DB_TIMEOUT || '60000')
    };
  } catch (error) {
    console.error('Multi-database configuration validation failed:', error);
    throw new Error(`Invalid multi-database configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateSingleDBConfig() {
  try {
    const config = SingleDBSchema.parse(process.env);
    return {
      connections: {
        default: {
          host: config.DB_HOST,
          port: config.DB_PORT,
          user: config.DB_USER,
          password: config.DB_PASSWORD,
          database: config.DB_NAME,
          ssl: config.DB_SSL
        }
      },
      defaultConnection: 'default',
      connectionLimit: config.DB_CONNECTION_LIMIT,
      timeout: config.DB_TIMEOUT
    };
  } catch (error) {
    console.error('Single database configuration validation failed:', error);
    throw new Error('Invalid configuration. Please check your .env file.');
  }
}

function validateConfig(): MultiDatabaseConfig {
  // 優先嘗試多資料庫配置
  const multiConfig = parseMultiDatabaseConfig();
  if (multiConfig) {
    console.log(`✅ Loaded multi-database configuration with ${Object.keys(multiConfig.connections).length} connections: ${Object.keys(multiConfig.connections).join(', ')}`);
    return multiConfig;
  }

  // 回退到單資料庫配置
  console.log('✅ Using single database configuration (backward compatibility)');
  return validateSingleDBConfig();
}

function validateServerConfig(): ServerConfig {
  try {
    const config = ServerConfigSchema.parse(process.env);
    const allowedOrigins = config.MCP_ALLOWED_ORIGINS === '*' 
      ? ['*'] 
      : config.MCP_ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
    
    return {
      port: config.MCP_SERVER_PORT,
      host: config.MCP_SERVER_HOST,
      allowedOrigins,
      transportMode: config.MCP_TRANSPORT_MODE,
      apiKey: config.MCP_API_KEY,
      enableCors: config.MCP_ENABLE_CORS
    };
  } catch (error) {
    console.error('Server configuration validation failed:', error);
    console.log('🔄 Using default server configuration');
    return {
      port: 3000,
      host: '0.0.0.0',
      allowedOrigins: ['*'],
      transportMode: 'stdio',
      enableCors: true
    };
  }
}

export const dbConfig = validateConfig();
export const serverConfig = validateServerConfig();