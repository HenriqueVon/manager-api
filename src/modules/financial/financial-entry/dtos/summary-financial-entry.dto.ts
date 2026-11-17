import { z } from 'zod';
import { FinancialEntryType, Prisma } from '@prisma/client';
import { summaryFinancialEntryQuerySchema } from '../schemas/summary-financial-entry-query.schema';

export type SummaryFinancialEntryQueryDto = z.infer<typeof summaryFinancialEntryQuerySchema>;

// The totals of the entries of one type in one currency
export interface FinancialEntrySummaryGroupDto {
  type                : FinancialEntryType;
  financialCurrencyId : string;
  count               : number;
  amount              : Prisma.Decimal;
  amountPaid          : Prisma.Decimal;
}
