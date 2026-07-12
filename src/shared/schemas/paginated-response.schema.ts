import { z } from 'zod';

export function paginatedResponseSchema<T extends z.ZodType>(
  itemSchema: T
) {
  return z.object({
    items : z.array(itemSchema),
    total : z.number().int().nonnegative(),
  });
}