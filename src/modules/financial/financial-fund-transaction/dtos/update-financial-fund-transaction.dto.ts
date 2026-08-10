import { z } from 'zod';
import { updateFinancialFundTransactionSchema } from '../schemas/update-financial-fund-transaction.schema';

export type UpdateFinancialFundTransactionDto = z.infer<typeof updateFinancialFundTransactionSchema>;
