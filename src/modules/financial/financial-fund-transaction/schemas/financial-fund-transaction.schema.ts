import { z } from 'zod';
import { decimalString, dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialFundTransaction` model as serialized to JSON
export const financialFundTransactionSchema = z.object({
  id                     : z.string(),
  transactionDate        : dateTimeString.openapi({ description: 'Date-only column, serialized as midnight UTC' }),
  amountCredit           : decimalString,
  amountDebit            : decimalString,
  additionalDescription  : z.string().nullable(),
  ledgerId               : z.string(),
  financialDescriptionId : z.string(),
  financialFundId        : z.string(),
  financialCategoryId    : z.string(),
  financialBankAccountId : z.string(),
  createdAt              : dateTimeString,
  updatedAt              : dateTimeString,
}).openapi('FinancialFundTransaction');
