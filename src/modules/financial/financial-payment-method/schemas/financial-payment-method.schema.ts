import { z } from 'zod';
import { createFinancialPaymentMethodSchema } from './create-financial-payment-method.schema';

export const financialPaymentMethodSchema = createFinancialPaymentMethodSchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
