import { z } from 'zod';
import { FinancialBankAccountType } from '@prisma/client';
import { decimalString, dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialBankAccount` model as serialized to JSON
export const financialBankAccountSchema = z.object({
  id                  : z.string(),
  name                : z.string(),
  type                : z.enum(FinancialBankAccountType),
  balance             : decimalString.nullable(),
  financialCurrencyId : z.string(),
  ledgerId            : z.string(),
  createdAt           : dateTimeString,
  updatedAt           : dateTimeString,
}).openapi('FinancialBankAccount');
