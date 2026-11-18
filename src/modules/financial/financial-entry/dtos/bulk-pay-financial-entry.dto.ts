import { z } from 'zod';
import { bulkPayFinancialEntrySchema } from '../schemas/bulk-pay-financial-entry.schema';

export type BulkPayFinancialEntryDto = z.infer<typeof bulkPayFinancialEntrySchema>;

// What the repository found when it was asked to pay several entries: nothing is changed unless both lists are empty.
export interface FinancialEntryPaymentResultDto {
  // The ids that do not exist
  missingIds: string[];
  // The ids of the entries that already have a payment date
  paidIds: string[];
}
