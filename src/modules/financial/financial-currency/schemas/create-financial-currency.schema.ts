import { z } from 'zod';

export const createFinancialCurrencySchema = z.object({
  name   : z.string().min(3, 'Name must have at least 3 characters').max(100, 'Name must have at most 100 characters'),
  symbol : z.string().min(1, 'Symbol must have at least 1 character').max(10, 'Symbol must have at most 10 characters'),
}).strict();
