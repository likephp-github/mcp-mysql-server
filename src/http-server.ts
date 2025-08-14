import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DatabaseConnection } from './database.js';
import { tools } from './tools.js';
import { QueryValidator, TableNameValidator, validateSQLQuery } from './validators.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { ServerConfig } from './config.js';

export class MCPDatabaseHTTPServer {
  private server: Server;
  private db: DatabaseConnection;
  private app: express.Application;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    
    this.server = new Server(
      {
        name: 'mysql-database-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.db = new DatabaseConnection();
    this.app = express();
    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware(): void {
    // 設置 CORS
    if (this.config.enableCors) {
      this.app.use(cors({
        origin: this.config.allowedOrigins.includes('*') ? true : this.config.allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      }));
    }

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // API Key 驗證中間件 (如果設定了)
    if (this.config.apiKey) {
      this.app.use('/mcp', (req: Request, res: Response, next) => {
        const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.query.api_key;
        if (apiKey !== this.config.apiKey) {
          return res.status(401).json({ error: 'Invalid API key' });
        }
        next();
      });
    }

    // 健康檢查端點
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'mysql-mcp-server'
      });
    });

    // API 資訊端點
    this.app.get('/api/info', (req: Request, res: Response) => {
      res.json({
        name: 'mysql-database-server',
        version: '1.0.0',
        capabilities: ['tools'],
        endpoints: {
          mcp: '/mcp',
          health: '/health',
          info: '/api/info'
        }
      });
    });
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'execute_query': {
            const validated = QueryValidator.parse(args);
            const { query, params, connection } = validated;
            
            validateSQLQuery(query);
            
            const result = await this.db.query(query, params, connection);
            const connectionName = connection || this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Query executed on connection '${connectionName}':\n${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          }

          case 'list_tables': {
            const validated = TableNameValidator.parse(args);
            const result = await this.db.listTables(validated.connection);
            const connectionName = validated.connection || this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Tables in connection '${connectionName}':\n${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          }

          case 'describe_table': {
            const validated = TableNameValidator.parse(args);
            const result = await this.db.getTableSchema(validated.table_name, validated.connection);
            const connectionName = validated.connection || this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Table '${validated.table_name}' structure in connection '${connectionName}':\n${JSON.stringify(result, null, 2)}`,
                },
              ],
            };
          }

          case 'test_connections': {
            const statusMap = await this.db.testAllConnections();
            const statusText = Object.entries(statusMap)
              .map(([name, status]) => `${name}: ${status ? '✅ Connected' : '❌ Failed'}`)
              .join('\n');

            return {
              content: [
                {
                  type: 'text',
                  text: `All connection test results:\n${statusText}`,
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    // 設置 SSE 端點
    this.app.get('/mcp', async (req: Request, res: Response) => {
      const transport = new SSEServerTransport('/mcp', res);
      await this.server.connect(transport);
    });

    // 啟動 HTTP 伺服器
    this.app.listen(this.config.port, this.config.host, () => {
      console.error(`🚀 MySQL MCP Server running on http://${this.config.host}:${this.config.port}`);
      console.error(`📊 Health check: http://${this.config.host}:${this.config.port}/health`);
      console.error(`🔗 MCP endpoint: http://${this.config.host}:${this.config.port}/mcp`);
      console.error(`📖 API info: http://${this.config.host}:${this.config.port}/api/info`);
      
      if (this.config.allowedOrigins.includes('*')) {
        console.error(`⚠️  CORS允許所有來源 - 僅供開發使用`);
      } else {
        console.error(`🔒 CORS允許的來源: ${this.config.allowedOrigins.join(', ')}`);
      }
      
      if (this.config.apiKey) {
        console.error(`🔐 API密鑰驗證已啟用`);
      }
    });
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}
