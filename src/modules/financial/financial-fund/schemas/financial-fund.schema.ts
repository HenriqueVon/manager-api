import { z } from 'zod';
import { createFinancialFundSchema } from './create-financial-fund.schema';

export const financialFundSchema = createFinancialFundSchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
