import { z } from 'zod';

export const updateFinancialFundTransactionSchema = z
  .object({
    transactionDate        : z.iso.date({ error: 'TransactionDate must be a valid ISO date' }).transform((value) => new Date(value)).optional(),
    amountCredit           : z.number().nonnegative().optional(),
    amountDebit            : z.number().nonnegative().optional(),
    additionalDescription  : z.string().min(2, 'AdditionalDescription must have at least 2 characters').max(100, 'AdditionalDescription must have at most 100 characters').optional(),
    ledgerId               : z.string().optional(),
    financialDescriptionId : z.string().optional(),
    financialFundId        : z.string().optional(),
    financialCategoryId    : z.string().optional(),
    financialBankAccountId : z.string().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided',
    }
  );
