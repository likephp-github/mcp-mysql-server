import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  {
    name: 'execute_query',
    description: 'Execute a SQL query on the MySQL/MariaDB database',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The SQL query to execute'
        },
        params: {
          type: 'array',
          description: 'Parameters for the SQL query (optional)',
          items: {
            type: 'string'
          }
        },
        connection: {
          type: 'string',
          description: 'Database connection name (optional, uses default if not specified)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'list_tables',
    description: 'List all tables in the database',
    inputSchema: {
      type: 'object',
      properties: {
        connection: {
          type: 'string',
          description: 'Database connection name (optional, uses default if not specified)'
        }
      }
    }
  },
  {
    name: 'describe_table',
    description: 'Get the schema/structure of a specific table',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: {
          type: 'string',
          description: 'Name of the table to describe'
        },
        connection: {
          type: 'string',
          description: 'Database connection name (optional, uses default if not specified)'
        }
      },
      required: ['table_name']
    }
  },
  {
    name: 'test_connection',
    description: 'Test the database connection',
    inputSchema: {
      type: 'object',
      properties: {
        connection: {
          type: 'string',
          description: 'Database connection name (optional, uses default if not specified)'
        }
      }
    }
  },
  {
    name: 'list_connections',
    description: 'List all available database connections',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_connection_info',
    description: 'Get information about a specific database connection',
    inputSchema: {
      type: 'object',
      properties: {
        connection: {
          type: 'string',
          description: 'Database connection name (optional, uses default if not specified)'
        }
      }
    }
  },
  {
    name: 'test_all_connections',
    description: 'Test all configured database connections',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];