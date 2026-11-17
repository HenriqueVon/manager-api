import { z } from 'zod';
import { createFinancialEntryInstallmentsSchema } from '../schemas/create-financial-entry-installments.schema';

export type CreateFinancialEntryInstallmentsDto = z.infer<typeof createFinancialEntryInstallmentsSchema>;
