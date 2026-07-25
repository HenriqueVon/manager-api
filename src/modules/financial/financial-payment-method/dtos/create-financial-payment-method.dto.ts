import { z } from 'zod';
import { createFinancialPaymentMethodSchema } from '../schemas/create-financial-payment-method.schema';

export type CreateFinancialPaymentMethodDto = z.infer<typeof createFinancialPaymentMethodSchema>;
