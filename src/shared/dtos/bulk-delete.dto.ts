import { z } from 'zod';
import { bulkDeleteSchema } from '@shared/schemas/bulk-delete.schema';

export type BulkDeleteDto = z.infer<typeof bulkDeleteSchema>;
