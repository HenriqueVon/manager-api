import { z } from 'zod';
import { updateFinancialDescriptionSchema } from '../schemas/update-financial-description.schema';

export type UpdateFinancialDescriptionDto = z.infer<typeof updateFinancialDescriptionSchema>;
