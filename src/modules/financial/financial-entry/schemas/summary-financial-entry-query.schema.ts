import { z } from 'zod';
import { FinancialEntryType } from '@prisma/client';
import { idSchema } from '@shared/schemas/id.schema';
import { MAX_BULK_DELETE } from '@shared/schemas/bulk-delete.schema';
import { entrySearch, isoDate } from './list-financial-entry-query.schema';

const ledgerId = z.string().optional().openapi({ description: 'Sums the records whose ledgerId equals the value. Example: cm1234567890abcdefghijkl.' });
const type = z.enum(FinancialEntryType).optional().openapi({ description: 'Sums the records of this type: PAYABLE or RECEIVABLE.' });

// The same filters as the list, without pagination and order. `paid` follows the payment date: true has one, false has none.
const periodFilters = {
  ledgerId,
  type,
  dueDateFrom : isoDate('dueDateFrom').optional().openapi({ type: 'string', format: 'date', description: 'Sums the records due on or after this date, inclusive. Example: 2026-01-01.' }),
  dueDateTo   : isoDate('dueDateTo').optional().openapi({ type: 'string', format: 'date', description: 'Sums the records due on or before this date, inclusive. Example: 2026-01-31.' }),
  paid        : z.enum(['true', 'false']).transform((value) => value === 'true').optional().openapi({
    type        : 'string',
    enum        : ['true', 'false'],
    description : 'true sums only the records with a payment date, false only the ones without it. Default: both.',
  }),
};

const hasValidPeriod = (query: { dueDateFrom?: Date; dueDateTo?: Date }) => !query.dueDateFrom || !query.dueDateTo || query.dueDateFrom <= query.dueDateTo;
const invalidPeriod = { message: 'dueDateFrom must be before or equal to dueDateTo', path: ['dueDateTo'] };

// `ids` narrows the entries to the ones given, and `search` to the ones of the text, like in the list
export const summaryFinancialEntryQuerySchema = z.object({
  ...periodFilters,
  search : entrySearch('Sums'),
  ids    : z
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
}).strict().refine(hasValidPeriod, invalidPeriod);

// The breakdowns by month and by category take the same filters, without the ids
export const summaryBreakdownFinancialEntryQuerySchema = z.object(periodFilters).strict().refine(hasValidPeriod, invalidPeriod);

// The aging looks at the entries not paid yet, counted from today: there is no period to choose
export const agingFinancialEntryQuerySchema = z.object({ ledgerId, type }).strict();
