import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';

export const MIN_INSTALLMENTS = 2;
export const MAX_INSTALLMENTS = 480;

// The complement of each installment is "<complement> <number>/<total>", or just "<number>/<total>" when the
// user sent no complement. It must still fit in the 100 characters of additionalDescription.
const MAX_ADDITIONAL_DESCRIPTION = 100;

export const createFinancialEntryInstallmentsSchema = z.object({
  type    : z.enum(FinancialEntryType),
  // The due date of the first installment; the others follow month by month
  dueDate : z.iso
    .date({
      error: 'DueDate must be a valid ISO date',
    })
    .transform((value) => new Date(`${value}T00:00:00.000Z`)),
  // The total amount, split between the installments
  amount                 : z.number().min(0.01, 'Amount must be greater than or equal to 0.01'),
  installments           : z.number().int().min(MIN_INSTALLMENTS, `Installments must be at least ${MIN_INSTALLMENTS}`).max(MAX_INSTALLMENTS, `Installments must be at most ${MAX_INSTALLMENTS}`),
  additionalDescription  : z.string().min(2, 'AdditionalDescription must have at least 2 characters').max(100, 'AdditionalDescription must have at most 100 characters').optional().nullable(),
  ledgerId               : z.string(),
  financialDescriptionId : z.string(),
  financialFundId        : z.string(),
  financialCategoryId    : z.string(),
}).strict()
  .refine(
    (data) => Math.round(data.amount * 100) >= data.installments,
    { message: 'Amount must be at least 0.01 per installment', path: ['amount'] }
  )
  .refine(
    (data) => {
      const counter = `${data.installments}/${data.installments}`;
      const complement = data.additionalDescription ? data.additionalDescription.length + 1 : 0;

      return complement + counter.length <= MAX_ADDITIONAL_DESCRIPTION;
    },
    { message: 'AdditionalDescription is too long to add the installment number', path: ['additionalDescription'] }
  );
