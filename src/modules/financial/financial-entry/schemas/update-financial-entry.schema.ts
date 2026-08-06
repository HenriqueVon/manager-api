import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';

export const updateFinancialEntrySchema = z
  .object({
    type    : z.enum(FinancialEntryType).optional(),
    dueDate : z.iso
      .date({
        error: 'DueDate must be a valid ISO date',
      })
      .transform((value) => new Date(`${value}T00:00:00.000Z`))
      .optional(),     
    paymentDate: z.iso
      .date({
        error: 'PaymentDate must be a valid ISO date',
      })
      .transform((value) => new Date(`${value}T00:00:00.000Z`))
      .optional()
      .nullable(),    
    amount                 : z.number().optional(),
    amountPaid             : z.number().optional(),
    additionalDescription  : z.string().min(2, 'AdditionalDescription must have at least 2 characters').max(100, 'AdditionalDescription must have at most 100 characters').optional(),
    isMonthly              : z.boolean().optional(),
    ledgerId               : z.string().optional(),
    financialDescriptionId : z.string().optional(),
    financialFundId        : z.string().optional(),
    financialCategoryId    : z.string().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
