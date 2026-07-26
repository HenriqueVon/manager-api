import { z } from 'zod';
import { updateFinancialBankAccountSchema } from '../schemas/update-financial-bank-account.schema';

export type UpdateFinancialBankAccountDto = z.infer<typeof updateFinancialBankAccountSchema>;
