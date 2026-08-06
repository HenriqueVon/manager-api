import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';

export const createFinancialEntrySchema = z.object({
  type    : z.enum(FinancialEntryType),
  dueDate : z.iso
    .date({
      error: 'DueDate must be a valid ISO date',
    })
    .transform((value) => new Date(`${value}T00:00:00.000Z`)),  
  paymentDate: z.iso
    .date({
      error: 'PaymentDate must be a valid ISO date',
    })
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .optional()
    .nullable(),    
  amount                 : z.number().min(0, 'Amount must be greater than or equal to 0'),
  amountPaid             : z.number().optional().default(0),
  additionalDescription  : z.string().min(2, 'AdditionalDescription must have at least 2 characters').max(100, 'AdditionalDescription must have at most 100 characters'),
  isMonthly              : z.boolean(),
  ledgerId               : z.string(),
  financialDescriptionId : z.string(),
  financialFundId        : z.string(),
  financialCategoryId    : z.string(),
}).strict();
