import { jest } from '@jest/globals';

// Mock dotenv before any imports
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock mysql2 to avoid database connections during tests
const mockPool = {
  execute: jest.fn(),
  end: jest.fn()
};

jest.mock('mysql2/promise', () => ({
  default: {
    createPool: jest.fn(() => mockPool)
  }
}));

describe('MCP Server Components', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_USER: 'testuser',
      DB_PASSWORD: 'testpass',
      DB_NAME: 'testdb'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be able to import database module', async () => {
    const databaseModule = await import('../database.js');
    expect(databaseModule.DatabaseConnection).toBeDefined();
  });

  it('should have all required tools defined', async () => {
    const { tools } = await import('../tools.js');
    
    expect(tools).toHaveLength(4);
    
    const toolNames = tools.map(tool => tool.name);
    expect(toolNames).toContain('execute_query');
    expect(toolNames).toContain('list_tables');
    expect(toolNames).toContain('describe_table');
    expect(toolNames).toContain('test_connection');
  });

  it('should validate tool schemas', async () => {
    const { tools } = await import('../tools.js');
    
    tools.forEach(tool => {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.properties).toBeDefined();
    });
  });
});