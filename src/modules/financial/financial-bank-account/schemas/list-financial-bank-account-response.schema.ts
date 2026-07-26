import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialBankAccountSchema } from './financial-bank-account.schema';

export const listFinancialBankAccountResponseSchema =
  paginatedResponseSchema(financialBankAccountSchema);
