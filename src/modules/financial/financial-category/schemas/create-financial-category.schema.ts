import { z } from 'zod';
import { FinancialCategoryType } from '@prisma/client';

export const createFinancialCategorySchema = z.object({
  name             : z.string().min(3, 'Name must have at least 3 characters').max(100, 'Name must have at most 100 characters'),
  type             : z.enum(FinancialCategoryType),
  balance          : z.number().optional().default(0),
  ledgerId         : z.string(),
  parentCategoryId : z.string().optional().nullable(),
}).strict();
