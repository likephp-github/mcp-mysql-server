import { QueryValidator, TableNameValidator, validateSQLQuery } from '../validators.js';

describe('Validators', () => {
  describe('QueryValidator', () => {
    it('should validate valid query', () => {
      const result = QueryValidator.parse({ query: 'SELECT * FROM users' });
      expect(result.query).toBe('SELECT * FROM users');
      expect(result.params).toEqual([]);
    });

    it('should validate query with params', () => {
      const result = QueryValidator.parse({ 
        query: 'SELECT * FROM users WHERE id = ?', 
        params: ['123'] 
      });
      expect(result.query).toBe('SELECT * FROM users WHERE id = ?');
      expect(result.params).toEqual(['123']);
    });

    it('should reject empty query', () => {
      expect(() => QueryValidator.parse({ query: '' })).toThrow();
    });
  });

  describe('TableNameValidator', () => {
    it('should validate valid table name', () => {
      const result = TableNameValidator.parse({ table_name: 'users' });
      expect(result.table_name).toBe('users');
    });

    it('should validate table name with underscores', () => {
      const result = TableNameValidator.parse({ table_name: 'user_profiles' });
      expect(result.table_name).toBe('user_profiles');
    });

    it('should reject invalid table name', () => {
      expect(() => TableNameValidator.parse({ table_name: '123invalid' })).toThrow();
      expect(() => TableNameValidator.parse({ table_name: 'table-name' })).toThrow();
    });
  });

  describe('validateSQLQuery', () => {
    it('should allow safe queries', () => {
      expect(() => validateSQLQuery('SELECT * FROM users')).not.toThrow();
      expect(() => validateSQLQuery('INSERT INTO users (name) VALUES (?)')).not.toThrow();
    });

    it('should block dangerous queries', () => {
      expect(() => validateSQLQuery('DROP DATABASE test')).toThrow('Dangerous SQL operation detected');
      expect(() => validateSQLQuery('TRUNCATE TABLE users')).toThrow('Dangerous SQL operation detected');
    });

    it('should warn about queries without WHERE clause', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      validateSQLQuery('DELETE FROM users');
      expect(consoleSpy).toHaveBeenCalledWith('Warning: Potentially dangerous SQL operation without WHERE clause');
      
      consoleSpy.mockRestore();
    });
  });
});