import { z } from 'zod';

export const createFinancialDescriptionSchema = z.object({
  description: z.string().min(3, 'Description must have at least 3 characters').max(100, 'Description must have at most 100 characters'),
}).strict();
