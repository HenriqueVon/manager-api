import { z } from 'zod';
import { FinancialCategoryType } from '@prisma/client';
import { decimalString, dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialCategory` model as serialized to JSON
export const financialCategorySchema = z.object({
  id               : z.string(),
  name             : z.string(),
  type             : z.enum(FinancialCategoryType),
  balance          : decimalString,
  ledgerId         : z.string(),
  parentCategoryId : z.string().nullable(),
  createdAt        : dateTimeString,
  updatedAt        : dateTimeString,
}).openapi('FinancialCategory');
