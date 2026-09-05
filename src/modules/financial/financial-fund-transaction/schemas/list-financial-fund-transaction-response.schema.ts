import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialFundTransactionSchema } from './financial-fund-transaction.schema';

export const listFinancialFundTransactionResponseSchema =
  paginatedResponseSchema(financialFundTransactionSchema);
