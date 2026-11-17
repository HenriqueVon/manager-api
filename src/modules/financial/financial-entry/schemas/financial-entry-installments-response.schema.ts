import { z } from 'zod';
import { financialEntrySchema } from './financial-entry.schema';

// The installments created, ordered by due date
export const financialEntryInstallmentsResponseSchema =
  z.array(financialEntrySchema).openapi('FinancialEntryInstallmentsResponse');
