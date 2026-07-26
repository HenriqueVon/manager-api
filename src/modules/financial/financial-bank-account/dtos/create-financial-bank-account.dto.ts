import { z } from 'zod';
import { createFinancialBankAccountSchema } from '../schemas/create-financial-bank-account.schema';

export type CreateFinancialBankAccountDto = z.infer<typeof createFinancialBankAccountSchema>;
