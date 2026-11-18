import { z } from 'zod';
import { financialEntrySchema } from './financial-entry.schema';

// The monthly entries created, ordered by due date
export const financialEntryMonthlyResponseSchema =
  z.array(financialEntrySchema).openapi('FinancialEntryMonthlyResponse');
