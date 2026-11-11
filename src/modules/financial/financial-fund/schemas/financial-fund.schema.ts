import { z } from 'zod';
import { decimalString, dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialFund` model as serialized to JSON
export const financialFundSchema = z.object({
  id                  : z.string(),
  name                : z.string(),
  balance             : decimalString.nullable(),
  financialCurrencyId : z.string(),
  ledgerId            : z.string(),
  createdAt           : dateTimeString,
  updatedAt           : dateTimeString,
}).openapi('FinancialFund');
