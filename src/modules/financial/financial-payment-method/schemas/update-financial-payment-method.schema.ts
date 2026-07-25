import { z } from 'zod';

export const updateFinancialPaymentMethodSchema = z
  .object({
    name: z.string().min(2, 'Name must have at least 2 characters').max(100, 'Name must have at most 100 characters').optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
