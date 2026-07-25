import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialDescriptionSchema } from './financial-description.schema';

export const listFinancialDescriptionResponseSchema =
  paginatedResponseSchema(financialDescriptionSchema);
