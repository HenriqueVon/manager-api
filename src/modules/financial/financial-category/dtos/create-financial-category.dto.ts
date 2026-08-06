import { z } from 'zod';
import { createFinancialCategorySchema } from '../schemas/create-financial-category.schema';

export type CreateFinancialCategoryDto = z.infer<typeof createFinancialCategorySchema>;
