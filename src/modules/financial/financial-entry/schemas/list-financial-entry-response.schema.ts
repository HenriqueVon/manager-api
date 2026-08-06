import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialEntrySchema } from './financial-entry.schema';

export const listFinancialEntryResponseSchema =
  paginatedResponseSchema(financialEntrySchema);
