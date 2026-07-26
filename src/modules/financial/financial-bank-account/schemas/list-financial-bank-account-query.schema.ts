import { z } from 'zod';

export const listFinancialBankAccountQuerySchema = z.object({
  limit          : z.coerce.number().int().min(1).max(100).optional(),
  offset         : z.coerce.number().int().min(0).optional(),
  orderBy        : z.enum(['id', 'name']).optional(),
  orderDirection : z.enum(['asc', 'desc']).optional(),
}).strict();
