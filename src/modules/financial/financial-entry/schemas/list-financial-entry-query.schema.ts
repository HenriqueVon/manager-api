import { z } from 'zod';

export const listFinancialEntryQuerySchema = z.object({
  limit          : z.coerce.number().int().min(1).max(100).optional(),
  offset         : z.coerce.number().int().min(0).optional(),
  orderBy        : z.enum(['id', 'dueDate', 'paymentDate', 'amount', 'amountPaid']).optional(),
  orderDirection : z.enum(['asc', 'desc']).optional(),
}).strict();
