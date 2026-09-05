import { z } from 'zod';

export const createFinancialFundTransactionSchema = z.object({
  transactionDate        : z.iso.date({ error: 'TransactionDate must be a valid ISO date' }).transform((value) => new Date(value)),
  amountCredit           : z.number().nonnegative().optional().default(0),
  amountDebit            : z.number().nonnegative().optional().default(0),
  additionalDescription  : z.string().min(2, 'AdditionalDescription must have at least 2 characters').max(100, 'AdditionalDescription must have at most 100 characters'),
  ledgerId               : z.string(),
  financialDescriptionId : z.string(),
  financialFundId        : z.string(),
  financialCategoryId    : z.string(),
  financialBankAccountId : z.string(),
}).strict();
