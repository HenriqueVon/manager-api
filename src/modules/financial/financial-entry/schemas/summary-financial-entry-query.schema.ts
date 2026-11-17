import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';
import { idSchema } from '@shared/schemas/id.schema';
import { MAX_BULK_DELETE } from '@shared/schemas/bulk-delete.schema';
import { isoDate } from './list-financial-entry-query.schema';

// The same filters as the list, without pagination and order. `ids` narrows the entries to the ones given.
export const summaryFinancialEntryQuerySchema = z.object({
  ledgerId    : z.string().optional().openapi({ description: 'Sums the records whose ledgerId equals the value. Example: cm1234567890abcdefghijkl.' }),
  type        : z.enum(FinancialEntryType).optional().openapi({ description: 'Sums the records of this type: PAYABLE or RECEIVABLE.' }),
  dueDateFrom : isoDate('dueDateFrom').optional().openapi({ type: 'string', format: 'date', description: 'Sums the records due on or after this date, inclusive. Example: 2026-01-01.' }),
  dueDateTo   : isoDate('dueDateTo').optional().openapi({ type: 'string', format: 'date', description: 'Sums the records due on or before this date, inclusive. Example: 2026-01-31.' }),
  ids         : z
    .string()
    .transform((value) => [...new Set(value.split(','))])
    .pipe(
      z.array(idSchema)
        .min(1, 'At least one id must be provided')
        .max(MAX_BULK_DELETE, `At most ${MAX_BULK_DELETE} ids can be provided`)
    )
    .optional()
    .openapi({
      type        : 'string',
      description : `Ids separated by commas, from 1 to ${MAX_BULK_DELETE}. Sums only these records, among the ones that match the other filters.`,
      example     : 'cm1234567890abcdefghijkl,cm1234567890abcdefghijkm',
    }),
}).strict().refine(
  (query) => !query.dueDateFrom || !query.dueDateTo || query.dueDateFrom <= query.dueDateTo,
  { message: 'dueDateFrom must be before or equal to dueDateTo', path: ['dueDateTo'] }
);
