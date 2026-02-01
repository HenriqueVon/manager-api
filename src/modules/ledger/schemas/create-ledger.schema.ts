import { z } from 'zod';
import { LedgerType } from '@prisma/client';

export const createLedgerSchema = z.object({
  name: z
    .string()
    .min(5, 'Name must have at least 5 characters')
    .max(100, 'Name must have at most 100 characters'),
  type: z.enum(LedgerType),
}).strict();