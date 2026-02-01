import { z } from 'zod';
import { LedgerType } from '@prisma/client';

export const updateLedgerSchema = z
  .object({
    name: z
      .string()
      .min(5, 'Name must have at least 5 characters')
      .max(100, 'Name must have at most 100 characters')
      .optional(),
    type: z.enum(LedgerType).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
