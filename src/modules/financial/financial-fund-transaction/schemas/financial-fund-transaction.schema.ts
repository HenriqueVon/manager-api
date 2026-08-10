import { z } from 'zod';
import { createFinancialFundTransactionSchema } from './create-financial-fund-transaction.schema';

export const financialFundTransactionSchema = createFinancialFundTransactionSchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
