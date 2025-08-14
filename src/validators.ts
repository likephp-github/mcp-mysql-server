import { z } from 'zod';

export const QueryValidator = z.object({
  query: z.string().min(1, 'Query cannot be empty'),
  params: z.array(z.string()).optional().default([]),
  connection: z.string().optional()
});

export const TableNameValidator = z.object({
  table_name: z.string().min(1, 'Table name cannot be empty').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid table name format'),
  connection: z.string().optional()
});

export function validateSQLQuery(query: string): void {
  const dangerousPatterns = [
    /DROP\s+DATABASE/i,
    /DROP\s+SCHEMA/i,
    /TRUNCATE/i,
  ];

  const warningPatterns = [
    /DELETE\s+FROM\s+\w+\s*(?:;|$)/i, // DELETE without WHERE
    /UPDATE\s+\w+\s+SET\s+.*?(?:;|$)(?!.*WHERE)/i, // UPDATE without WHERE
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      throw new Error('Dangerous SQL operation detected and blocked');
    }
  }

  for (const pattern of warningPatterns) {
    if (pattern.test(query)) {
      console.warn('Warning: Potentially dangerous SQL operation without WHERE clause');
    }
  }
}