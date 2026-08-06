import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialCategorySchema } from './financial-category.schema';

export const listFinancialCategoryResponseSchema =
  paginatedResponseSchema(financialCategorySchema);
