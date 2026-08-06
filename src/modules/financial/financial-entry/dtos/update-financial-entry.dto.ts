import { z } from 'zod';
import { updateFinancialEntrySchema } from '../schemas/update-financial-entry.schema';

export type UpdateFinancialEntryDto = z.infer<typeof updateFinancialEntrySchema>;
