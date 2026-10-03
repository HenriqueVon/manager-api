import { z } from 'zod';
import { dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialCurrency` model as serialized to JSON
export const financialCurrencySchema = z.object({
  id        : z.string(),
  name      : z.string(),
  symbol    : z.string(),
  createdAt : dateTimeString,
  updatedAt : dateTimeString,
}).openapi('FinancialCurrency');
