import { z } from 'zod';
import { FinancialEntryType, Prisma } from '@prisma/client';
import {
  summaryFinancialEntryQuerySchema,
  summaryBreakdownFinancialEntryQuerySchema,
  agingFinancialEntryQuerySchema
} from '../schemas/summary-financial-entry-query.schema';
import { financialEntryAgingBandSchema } from '../schemas/summary-breakdown-financial-entry-response.schema';

export type SummaryFinancialEntryQueryDto = z.infer<typeof summaryFinancialEntryQuerySchema>;
export type SummaryBreakdownFinancialEntryQueryDto = z.infer<typeof summaryBreakdownFinancialEntryQuerySchema>;
export type AgingFinancialEntryQueryDto = z.infer<typeof agingFinancialEntryQuerySchema>;

// The filters of the summaries that are not a date range
export interface FinancialEntrySummaryFiltersDto {
  ledgerId? : string;
  type?     : FinancialEntryType;
  ids?      : string[];
  paid?     : boolean;
  // Every word must be in the description or in the additionalDescription of the entry
  search?   : string;
}

// The totals of the entries of one type in one currency
export interface FinancialEntrySummaryGroupDto {
  type                : FinancialEntryType;
  financialCurrencyId : string;
  count               : number;
  amount              : Prisma.Decimal;
  amountPaid          : Prisma.Decimal;
}

// The same totals inside one month of the due date (YYYY-MM)
export interface FinancialEntrySummaryMonthDto extends FinancialEntrySummaryGroupDto {
  month: string;
}

// The same totals inside one category
export interface FinancialEntrySummaryCategoryDto extends FinancialEntrySummaryGroupDto {
  financialCategoryId: string;
}

export type FinancialEntryAgingBand = z.infer<typeof financialEntryAgingBandSchema>;

// What is still to pay or receive (amount minus amount paid) in one band, type and currency
export interface FinancialEntryAgingGroupDto {
  band                : FinancialEntryAgingBand;
  type                : FinancialEntryType;
  financialCurrencyId : string;
  count               : number;
  amountOpen          : Prisma.Decimal;
}
