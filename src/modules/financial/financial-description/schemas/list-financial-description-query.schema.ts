import { z } from 'zod';

export const listFinancialDescriptionQuerySchema = z.object({
  limit          : z.coerce.number().int().min(1).max(100).optional(),
  offset         : z.coerce.number().int().min(0).optional(),
  orderBy        : z.enum(['id', 'description']).optional(),
  orderDirection : z.enum(['asc', 'desc']).optional(),
}).strict();
