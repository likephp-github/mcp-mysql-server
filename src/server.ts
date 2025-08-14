import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DatabaseConnection } from './database.js';
import { tools } from './tools.js';
import { QueryValidator, TableNameValidator, validateSQLQuery } from './validators.js';

export class MCPDatabaseServer {
  private server: Server;
  private db: DatabaseConnection;

  constructor() {
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
    this.setupHandlers();
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
            const { connection } = args as { connection?: string };
            const tables = await this.db.listTables(connection);
            const connectionName = connection || this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Available tables in '${connectionName}':\n${tables.join('\n')}`,
                },
              ],
            };
          }

          case 'describe_table': {
            const validated = TableNameValidator.parse(args);
            const { table_name, connection } = validated;
            const schema = await this.db.getTableSchema(table_name, connection);
            const connectionName = connection || this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Table '${table_name}' structure in '${connectionName}':\n${JSON.stringify(schema, null, 2)}`,
                },
              ],
            };
          }

          case 'test_connection': {
            const { connection } = args as { connection?: string };
            const isConnected = await this.db.testConnection(connection);
            const connectionName = connection || this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Database connection '${connectionName}': ${isConnected ? 'SUCCESS' : 'FAILED'}`,
                },
              ],
            };
          }

          case 'list_connections': {
            const connections = this.db.getAvailableConnections();
            const defaultConnection = this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Available database connections:\n${connections.map(conn => 
                    conn === defaultConnection ? `${conn} (default)` : conn
                  ).join('\n')}`,
                },
              ],
            };
          }

          case 'get_connection_info': {
            const { connection } = args as { connection?: string };
            const info = this.db.getConnectionInfo(connection);
            const connectionName = connection || this.db.getDefaultConnection();
            return {
              content: [
                {
                  type: 'text',
                  text: `Connection '${connectionName}' information:\n${JSON.stringify(info, null, 2)}`,
                },
              ],
            };
          }

          case 'test_all_connections': {
            const results = await this.db.testAllConnections();
            const statusText = Object.entries(results)
              .map(([name, status]) => `${name}: ${status ? 'SUCCESS' : 'FAILED'}`)
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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MySQL MCP Server running on stdio');
  }

  async close(): Promise<void> {
    await this.db.close();
  }
}