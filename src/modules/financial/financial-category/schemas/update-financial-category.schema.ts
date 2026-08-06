import { z } from 'zod';
import { FinancialCategoryType } from '@prisma/client';

export const updateFinancialCategorySchema = z
  .object({
    name             : z.string().min(3, 'Name must have at least 3 characters').max(100, 'Name must have at most 100 characters').optional(),
    type             : z.enum(FinancialCategoryType).optional(),
    balance          : z.number().optional(),
    ledgerId         : z.string().optional(),
    parentCategoryId : z.string().optional().nullable(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
