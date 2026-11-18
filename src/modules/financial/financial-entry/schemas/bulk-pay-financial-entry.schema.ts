import { z } from 'zod';
import { idSchema } from '@shared/schemas/id.schema';

export const MAX_BULK_PAY = 100;

// The ids of the entries to mark as paid in one call. The limit counts the ids sent; a repeated id is paid once.
export const bulkPayFinancialEntrySchema = z.object({
  ids: z
    .array(idSchema)
    .min(1, 'At least one id must be provided')
    .max(MAX_BULK_PAY, `At most ${MAX_BULK_PAY} ids can be provided`)
    .transform((ids) => [...new Set(ids)])
    .openapi({ description: `Ids of the entries to mark as paid, from 1 to ${MAX_BULK_PAY}. A repeated id is paid once.` }),
}).strict();
