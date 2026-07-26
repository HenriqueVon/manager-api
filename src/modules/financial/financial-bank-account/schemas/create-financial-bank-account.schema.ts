import { z } from 'zod';
import { FinancialBankAccountType } from '@prisma/client';

export const createFinancialBankAccountSchema = z.object({
  name                : z.string().min(3, 'Name must have at least 3 characters').max(100, 'Name must have at most 100 characters'),
  type                : z.enum(FinancialBankAccountType),
  balance             : z.number().optional().default(0),
  ledgerId            : z.string(),
  financialCurrencyId : z.string(),
}).strict();
