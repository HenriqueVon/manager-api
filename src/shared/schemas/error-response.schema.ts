import { z } from 'zod';

// Body produced by errorHandler for AppError subclasses
export const appErrorResponseSchema = z.object({
  message : z.string(),
  code    : z.enum(['BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'CONFLICT']),
});

// Body produced by validateRequest when params, query or body fail Zod validation
export const validationErrorResponseSchema = z.object({
  message : z.enum(['Invalid params', 'Invalid query', 'Invalid body']),
  errors  : z.record(z.string(), z.unknown()),
  issues  : z.array(z.object({
    path    : z.string(),
    message : z.string(),
    code    : z.string(),
  })),
});

// Body produced by errorHandler for any error that is not an AppError
export const internalErrorResponseSchema = z.object({
  message: z.literal('Internal server error'),
});
