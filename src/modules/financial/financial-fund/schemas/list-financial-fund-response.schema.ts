import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialFundSchema } from './financial-fund.schema';

export const listFinancialFundResponseSchema =
  paginatedResponseSchema(financialFundSchema);
