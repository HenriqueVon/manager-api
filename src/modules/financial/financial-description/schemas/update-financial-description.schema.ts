import { z } from 'zod';

export const updateFinancialDescriptionSchema = z
  .object({
    description: z.string().min(3, 'Description must have at least 3 characters').max(100, 'Description must have at most 100 characters').optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
