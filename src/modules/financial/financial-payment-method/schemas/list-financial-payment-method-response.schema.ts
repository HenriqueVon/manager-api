import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { financialPaymentMethodSchema } from './financial-payment-method.schema';

export const listFinancialPaymentMethodResponseSchema =
  paginatedResponseSchema(financialPaymentMethodSchema);
