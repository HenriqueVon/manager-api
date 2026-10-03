import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';
import { decimalString, dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialEntry` model as serialized to JSON
export const financialEntrySchema = z.object({
  id                     : z.string(),
  type                   : z.enum(FinancialEntryType),
  dueDate                : dateTimeString,
  paymentDate            : dateTimeString.nullable(),
  amount                 : decimalString,
  amountPaid             : decimalString,
  additionalDescription  : z.string().nullable(),
  isMonthly              : z.boolean(),
  ledgerId               : z.string(),
  financialDescriptionId : z.string(),
  financialFundId        : z.string(),
  financialCategoryId    : z.string(),
  createdAt              : dateTimeString,
  updatedAt              : dateTimeString,
}).openapi('FinancialEntry');
