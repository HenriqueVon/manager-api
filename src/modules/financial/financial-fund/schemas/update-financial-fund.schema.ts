import { z } from 'zod';

export const updateFinancialFundSchema = z
  .object({
    name                : z.string().min(3, 'Name must have at least 3 characters').max(100, 'Name must have at most 100 characters').optional(),
    balance             : z.number().optional(),
    ledgerId            : z.string().optional(),
    financialCurrencyId : z.string().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
