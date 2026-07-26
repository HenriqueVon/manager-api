import { z } from 'zod';
import { createFinancialBankAccountSchema } from './create-financial-bank-account.schema';

export const financialBankAccountSchema = createFinancialBankAccountSchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
