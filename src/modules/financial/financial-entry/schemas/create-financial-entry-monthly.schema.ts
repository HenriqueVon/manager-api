import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';

export const MIN_REPEAT_COUNT = 2;
export const MAX_REPEAT_COUNT = 60;

export const createFinancialEntryMonthlySchema = z.object({
  type    : z.enum(FinancialEntryType),
  // The due date of the first entry; the others follow month by month
  dueDate : z.iso
    .date({
      error: 'DueDate must be a valid ISO date',
    })
    .transform((value) => new Date(`${value}T00:00:00.000Z`)),
  // The amount of each entry: it is repeated, not split
  amount                 : z.number().min(0.01, 'Amount must be greater than or equal to 0.01'),
  // How many entries are created, the first one included
  repeatCount            : z.number().int().min(MIN_REPEAT_COUNT, `RepeatCount must be at least ${MIN_REPEAT_COUNT}`).max(MAX_REPEAT_COUNT, `RepeatCount must be at most ${MAX_REPEAT_COUNT}`),
  additionalDescription  : z.string().min(2, 'AdditionalDescription must have at least 2 characters').max(100, 'AdditionalDescription must have at most 100 characters').optional().nullable(),
  ledgerId               : z.string(),
  financialDescriptionId : z.string(),
  financialFundId        : z.string(),
  financialCategoryId    : z.string(),
}).strict();
