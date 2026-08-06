import { z } from 'zod';
import { createFinancialFundSchema } from '../schemas/create-financial-fund.schema';

export type CreateFinancialFundDto = z.infer<typeof createFinancialFundSchema>;
