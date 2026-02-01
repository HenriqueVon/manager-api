// src/shared/schemas/id.schema.ts
import { z } from 'zod';

export const idSchema = z.cuid({ error: 'Invalid id' });

export const idParamsSchema = z.object({
  id: idSchema,
});

export type IdParamsDto = z.infer<typeof idParamsSchema>;