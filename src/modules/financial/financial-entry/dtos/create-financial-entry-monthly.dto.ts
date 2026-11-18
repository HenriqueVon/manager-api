import { z } from 'zod';
import { createFinancialEntryMonthlySchema } from '../schemas/create-financial-entry-monthly.schema';

export type CreateFinancialEntryMonthlyDto = z.infer<typeof createFinancialEntryMonthlySchema>;
