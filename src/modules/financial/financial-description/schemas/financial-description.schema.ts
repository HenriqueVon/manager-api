import { z } from 'zod';
import { createFinancialDescriptionSchema } from './create-financial-description.schema';

export const financialDescriptionSchema = createFinancialDescriptionSchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
