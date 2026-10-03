import { z } from 'zod';
import { FinancialCategoryType } from '@prisma/client';
import { decimalString, dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialCategory` model as serialized to JSON
export const financialCategorySchema = z.object({
  id               : z.string(),
  ledgerId         : z.string(),
  parentCategoryId : z.string().nullable(),
  name             : z.string(),
  type             : z.enum(FinancialCategoryType),
  balance          : decimalString,
  createdAt        : dateTimeString,
  updatedAt        : dateTimeString,
}).openapi('FinancialCategory');
