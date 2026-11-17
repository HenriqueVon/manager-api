import { z } from 'zod';
import { idSchema } from './id.schema';

export const MAX_BULK_DELETE = 100;

// The ids of the records to delete in one call. The limit counts the ids sent; a repeated id is deleted once.
export const bulkDeleteSchema = z.object({
  ids: z
    .array(idSchema)
    .min(1, 'At least one id must be provided')
    .max(MAX_BULK_DELETE, `At most ${MAX_BULK_DELETE} ids can be provided`)
    .transform((ids) => [...new Set(ids)])
    .openapi({ description: `Ids of the records to delete, from 1 to ${MAX_BULK_DELETE}. A repeated id is deleted once.` }),
}).strict();
