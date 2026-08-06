import { z } from 'zod';
import { createFinancialEntrySchema } from './create-financial-entry.schema';

export const financialEntrySchema = createFinancialEntrySchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
