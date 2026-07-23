import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialCurrencySchema } from './financial-currency.schema';

export const listFinancialCurrencyResponseSchema =
  paginatedResponseSchema(financialCurrencySchema);
