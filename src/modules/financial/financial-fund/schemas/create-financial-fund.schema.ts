import { z } from 'zod';

export const createFinancialFundSchema = z.object({
  name                : z.string().min(3, 'Name must have at least 3 characters').max(100, 'Name must have at most 100 characters'),
  balance             : z.number().optional().default(0),
  ledgerId            : z.string(),
  financialCurrencyId : z.string(),
}).strict();
