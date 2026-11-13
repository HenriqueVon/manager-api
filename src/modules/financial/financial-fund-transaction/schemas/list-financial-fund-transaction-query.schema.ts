import { z } from 'zod';

// Dates are stored at midnight UTC, as in the create schema
const isoDate = (field: string) => z.iso
  .date({ error: `${field} must be a valid ISO date` })
  .transform((value) => new Date(value));

export const listFinancialFundTransactionQuerySchema = z.object({
  limit               : z.coerce.number().int().min(1).max(100).optional().openapi({ description: 'Number of records per page, from 1 to 100. Default: 20.' }),
  offset              : z.coerce.number().int().min(0).optional().openapi({ type: 'integer', minimum: 0, description: 'Number of records to skip. Default: 0.' }),
  orderBy             : z.enum(['id', 'transactionDate', 'amountCredit', 'amountDebit']).optional().openapi({ description: 'Field to sort by. Default: transactionDate.' }),
  orderDirection      : z.enum(['asc', 'desc']).optional().openapi({ description: 'Sort direction. Default: asc.' }),
  ledgerId            : z.string().optional().openapi({ description: 'Returns the records whose ledgerId equals the value. Example: cm1234567890abcdefghijkl.' }),
  transactionDateFrom : isoDate('transactionDateFrom').optional().openapi({ type: 'string', format: 'date', description: 'Returns the records dated on or after this date, inclusive. Example: 2026-01-01.' }),
  transactionDateTo   : isoDate('transactionDateTo').optional().openapi({ type: 'string', format: 'date', description: 'Returns the records dated on or before this date, inclusive. Example: 2026-01-31.' }),
}).strict().refine(
  (query) => !query.transactionDateFrom || !query.transactionDateTo || query.transactionDateFrom <= query.transactionDateTo,
  { message: 'transactionDateFrom must be before or equal to transactionDateTo', path: ['transactionDateTo'] }
);
