import { jest } from '@jest/globals';

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock mysql2 with realistic responses
const mockResults = {
  testQuery: [{ id: 1, name: 'test' }],
  listTables: [{ 'Tables_in_testdb': 'users' }, { 'Tables_in_testdb': 'products' }],
  describeTable: [
    { Field: 'id', Type: 'int(11)', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
    { Field: 'name', Type: 'varchar(255)', Null: 'YES', Key: '', Default: null, Extra: '' }
  ]
};

const mockPool = {
  execute: jest.fn() as jest.MockedFunction<any>,
  end: jest.fn() as jest.MockedFunction<any>
};

jest.mock('mysql2/promise', () => ({
  default: {
    createPool: jest.fn(() => mockPool)
  }
}));

describe('Database Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    
    process.env = {
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_USER: 'testuser',
      DB_PASSWORD: 'testpass',
      DB_NAME: 'testdb',
      DB_SSL: 'false'
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should execute basic queries', async () => {
    mockPool.execute.mockResolvedValue([mockResults.testQuery]);

    const { DatabaseConnection } = await import('../database.js');
    const db = new DatabaseConnection();

    const result = await db.query('SELECT * FROM users');
    
    expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users', []);
    expect(result).toEqual(mockResults.testQuery);

    await db.close();
  });

  it('should execute parameterized queries', async () => {
    mockPool.execute.mockResolvedValue([mockResults.testQuery]);

    const { DatabaseConnection } = await import('../database.js');
    const db = new DatabaseConnection();

    const result = await db.query('SELECT * FROM users WHERE id = ?', ['1']);
    
    expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', ['1']);
    expect(result).toEqual(mockResults.testQuery);

    await db.close();
  });

  it('should list tables', async () => {
    mockPool.execute.mockResolvedValue([mockResults.listTables]);

    const { DatabaseConnection } = await import('../database.js');
    const db = new DatabaseConnection();

    const result = await db.listTables();
    
    expect(mockPool.execute).toHaveBeenCalledWith('SHOW TABLES');
    expect(result).toEqual(['users', 'products']);

    await db.close();
  });

  it('should describe table schema', async () => {
    mockPool.execute.mockResolvedValue([mockResults.describeTable]);

    const { DatabaseConnection } = await import('../database.js');
    const db = new DatabaseConnection();

    const result = await db.getTableSchema('users');
    
    expect(mockPool.execute).toHaveBeenCalledWith('DESCRIBE ??', ['users']);
    expect(result).toEqual(mockResults.describeTable);

    await db.close();
  });

  it('should test connection', async () => {
    mockPool.execute.mockResolvedValue([{ '1': 1 }]);

    const { DatabaseConnection } = await import('../database.js');
    const db = new DatabaseConnection();

    const result = await db.testConnection();
    
    expect(mockPool.execute).toHaveBeenCalledWith('SELECT 1');
    expect(result).toBe(true);

    await db.close();
  });

  it('should handle connection errors', async () => {
    mockPool.execute.mockRejectedValue(new Error('Connection failed'));

    const { DatabaseConnection } = await import('../database.js');
    const db = new DatabaseConnection();

    const result = await db.testConnection();
    
    expect(result).toBe(false);

    await db.close();
  });

  it('should handle query errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPool.execute.mockRejectedValue(new Error('SQL syntax error'));

    const { DatabaseConnection } = await import('../database.js');
    const db = new DatabaseConnection();

    await expect(db.query('INVALID SQL')).rejects.toThrow('SQL syntax error');
    expect(consoleSpy).toHaveBeenCalledWith('Database query error:', expect.any(Error));

    consoleSpy.mockRestore();
    await db.close();
  });
});