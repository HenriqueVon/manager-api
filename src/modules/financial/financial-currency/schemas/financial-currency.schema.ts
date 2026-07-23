import { z } from 'zod';
import { createFinancialCurrencySchema } from './create-financial-currency.schema';

export const financialCurrencySchema = createFinancialCurrencySchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
