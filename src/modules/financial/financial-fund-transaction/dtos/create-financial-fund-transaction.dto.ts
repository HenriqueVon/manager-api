import { z } from 'zod';
import { createFinancialFundTransactionSchema } from '../schemas/create-financial-fund-transaction.schema';

export type CreateFinancialFundTransactionDto = z.infer<typeof createFinancialFundTransactionSchema>;
