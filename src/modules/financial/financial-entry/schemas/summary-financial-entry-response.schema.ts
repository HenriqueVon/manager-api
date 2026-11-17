import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';
import { decimalString } from '@shared/schemas/output.schema';

// One group per type and currency: amounts of different currencies are never added together
export const financialEntrySummaryGroupSchema = z.object({
  type                : z.enum(FinancialEntryType),
  financialCurrencyId : z.string(),
  count               : z.number().int().nonnegative(),
  amount              : decimalString,
  amountPaid          : decimalString,
}).openapi('FinancialEntrySummaryGroup');

export const summaryFinancialEntryResponseSchema = z.object({
  items: z.array(financialEntrySummaryGroupSchema),
}).openapi('SummaryFinancialEntryResponse');
