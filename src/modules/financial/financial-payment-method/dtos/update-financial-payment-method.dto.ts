import { z } from 'zod';
import { updateFinancialPaymentMethodSchema } from '../schemas/update-financial-payment-method.schema';

export type UpdateFinancialPaymentMethodDto = z.infer<typeof updateFinancialPaymentMethodSchema>;
