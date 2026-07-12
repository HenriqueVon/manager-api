import { z } from 'zod';

export const idSchema = z.cuid({ error: 'Invalid id' });

export const idParamsSchema = z.object({
  id: idSchema.openapi({
    param: {
      name     : 'id',
      in       : 'path',
      required : true,
    },
    description : 'Resource identifier',
    example     : 'cm1234567890abcdefghijk',
  }),
});

export type IdParamsDto = z.infer<typeof idParamsSchema>;