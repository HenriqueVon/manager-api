import { z } from 'zod';
import { createFinancialCategorySchema } from './create-financial-category.schema';

export const financialCategorySchema = createFinancialCategorySchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
