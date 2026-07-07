import { z } from 'zod';
import { createFinancialCurrencySchema } from '../schemas/create-financial-currency.schema';

export type CreateFinancialCurrencyDto = z.infer<typeof createFinancialCurrencySchema>;
