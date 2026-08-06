import { z } from 'zod';
import { updateFinancialFundSchema } from '../schemas/update-financial-fund.schema';

export type UpdateFinancialFundDto = z.infer<typeof updateFinancialFundSchema>;
