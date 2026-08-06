import { z } from 'zod';
import { createFinancialEntrySchema } from '../schemas/create-financial-entry.schema';

export type CreateFinancialEntryDto = z.infer<typeof createFinancialEntrySchema>;