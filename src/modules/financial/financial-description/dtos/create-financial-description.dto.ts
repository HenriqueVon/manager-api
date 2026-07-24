import { z } from 'zod';
import { createFinancialDescriptionSchema } from '../schemas/create-financial-description.schema';

export type CreateFinancialDescriptionDto = z.infer<typeof createFinancialDescriptionSchema>;
