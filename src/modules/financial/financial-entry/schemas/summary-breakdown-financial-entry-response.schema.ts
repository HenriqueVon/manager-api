import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';
import { decimalString } from '@shared/schemas/output.schema';

// One group per type and currency inside each month, category or band: amounts of different currencies are never added together
const totals = {
  type                : z.enum(FinancialEntryType),
  financialCurrencyId : z.string(),
  count               : z.number().int().nonnegative(),
};

// From the most urgent to the least: OVERDUE is before today, the others count the days from today to the due date
export const financialEntryAgingBandSchema = z.enum(['OVERDUE', 'DAYS_0_7', 'DAYS_8_30', 'DAYS_31_90', 'OVER_90']);

const withPaid = { amount: decimalString, amountPaid: decimalString };

export const financialEntrySummaryMonthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).openapi({ description: 'Month of the due date, in the format YYYY-MM.', example: '2026-11' }),
  ...totals,
  ...withPaid,
}).openapi('FinancialEntrySummaryMonth');

export const financialEntrySummaryCategorySchema = z.object({
  financialCategoryId: z.string(),
  ...totals,
  ...withPaid,
}).openapi('FinancialEntrySummaryCategory');

export const financialEntryAgingGroupSchema = z.object({
  band: financialEntryAgingBandSchema.openapi({
    description: 'Days from today to the due date: OVERDUE is before today, then 0 to 7, 8 to 30, 31 to 90 and more than 90 days.',
  }),
  ...totals,
  amountOpen: decimalString.openapi({ description: 'Amount minus amount paid, summed.' }),
}).openapi('FinancialEntryAgingGroup');

export const summaryByMonthFinancialEntryResponseSchema = z.object({
  items: z.array(financialEntrySummaryMonthSchema),
}).openapi('SummaryByMonthFinancialEntryResponse');

export const summaryByCategoryFinancialEntryResponseSchema = z.object({
  items: z.array(financialEntrySummaryCategorySchema),
}).openapi('SummaryByCategoryFinancialEntryResponse');

export const agingFinancialEntryResponseSchema = z.object({
  items: z.array(financialEntryAgingGroupSchema),
}).openapi('AgingFinancialEntryResponse');
