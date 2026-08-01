import { z } from 'zod';
import { updateFinancialCategorySchema } from '../schemas/update-financial-category.schema';

export type UpdateFinancialCategoryDto = z.infer<typeof updateFinancialCategorySchema>;
