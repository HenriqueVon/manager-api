import { z } from 'zod';

export const createFinancialPaymentMethodSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').max(100, 'Name must have at most 100 characters'),
}).strict();
