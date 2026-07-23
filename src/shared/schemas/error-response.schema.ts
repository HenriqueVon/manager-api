import { z } from 'zod';

export const errorResponseSchema = z.object({
  statusCode : z.number().int(),
  message    : z.string(),
  error      : z.string().optional(),
});