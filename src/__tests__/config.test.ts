import { jest } from '@jest/globals';

// Mock dotenv before any imports
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Config Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {};
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should validate valid configuration', async () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_NAME = 'testdb';

    const { dbConfig } = await import('../config.js');
    
    expect(dbConfig.DB_HOST).toBe('localhost');
    expect(dbConfig.DB_PORT).toBe(3306);
    expect(dbConfig.DB_USER).toBe('testuser');
    expect(dbConfig.DB_PASSWORD).toBe('testpass');
    expect(dbConfig.DB_NAME).toBe('testdb');
    expect(dbConfig.DB_SSL).toBe(false);
  });

  it('should use default values for optional fields', async () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_NAME = 'testdb';

    const { dbConfig } = await import('../config.js');
    
    expect(dbConfig.DB_PORT).toBe(3306);
    expect(dbConfig.DB_SSL).toBe(false);
    expect(dbConfig.DB_CONNECTION_LIMIT).toBe(10);
    expect(dbConfig.DB_TIMEOUT).toBe(60000);
  });

  it('should handle SSL configuration', async () => {
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_NAME = 'testdb';
    process.env.DB_SSL = 'true';

    const { dbConfig } = await import('../config.js');
    
    expect(dbConfig.DB_SSL).toBe(true);
  });

  it('should throw error for missing required fields', async () => {
    process.env.DB_HOST = 'localhost';
    // Missing DB_USER, DB_PASSWORD, DB_NAME

    await expect(async () => {
      await import('../config.js');
    }).rejects.toThrow('Invalid configuration');
  });
});