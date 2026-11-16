import { z } from 'zod';

// Dates are stored at midnight UTC, as in the create schema
const isoDate = (field: string) => z.iso
  .date({ error: `${field} must be a valid ISO date` })
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

export const listFinancialEntryQuerySchema = z.object({
  limit          : z.coerce.number().int().min(1).max(100).optional().openapi({ description: 'Number of records per page, from 1 to 100. Default: 20.' }),
  offset         : z.coerce.number().int().min(0).optional().openapi({ type: 'integer', minimum: 0, description: 'Number of records to skip. Default: 0.' }),
  orderBy        : z.enum(['id', 'dueDate', 'paymentDate', 'amount', 'amountPaid']).optional().openapi({ description: 'Field to sort by. Default: dueDate.' }),
  orderDirection : z.enum(['asc', 'desc']).optional().openapi({ description: 'Sort direction. Default: asc.' }),
  ledgerId       : z.string().optional().openapi({ description: 'Returns the records whose ledgerId equals the value. Example: cm1234567890abcdefghijkl.' }),
  dueDateFrom    : isoDate('dueDateFrom').optional().openapi({ type: 'string', format: 'date', description: 'Returns the records due on or after this date, inclusive. Example: 2026-01-01.' }),
  dueDateTo      : isoDate('dueDateTo').optional().openapi({ type: 'string', format: 'date', description: 'Returns the records due on or before this date, inclusive. Example: 2026-01-31.' }),
}).strict().refine(
  (query) => !query.dueDateFrom || !query.dueDateTo || query.dueDateFrom <= query.dueDateTo,
  { message: 'dueDateFrom must be before or equal to dueDateTo', path: ['dueDateTo'] }
);
