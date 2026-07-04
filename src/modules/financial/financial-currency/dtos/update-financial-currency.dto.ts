import { z } from 'zod';
import { updateFinancialCurrencySchema } from '../schemas/update-financial-currency.schema';

export type UpdateFinancialCurrencyDto = z.infer<typeof updateFinancialCurrencySchema>;
