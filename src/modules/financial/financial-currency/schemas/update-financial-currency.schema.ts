import { z } from 'zod';

export const updateFinancialCurrencySchema = z
  .object({
    name   : z.string().min(3, 'Name must have at least 3 characters').max(100, 'Name must have at most 100 characters').optional(),
    symbol : z.string().min(2, 'Symbol must have at least 2 characters').max(10, 'Symbol must have at most 10 characters').optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
