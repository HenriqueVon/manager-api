import { z } from 'zod';

// Codes of the authentication API, relayed as they are (UpstreamAuthError), plus
// AUTH_API_UNAVAILABLE, which this API produces when the authentication API cannot be used
export const upstreamAuthErrorCodes = [
  'AUTH_CODE_INVALID',
  'AUTH_TOKEN_INVALID',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_SESSION_REVOKED',
  'CLIENT_DISABLED',
  'MEMBERSHIP_NOT_FOUND',
  'MEMBERSHIP_BLOCKED',
  'RATE_LIMITED',
  'AUTH_API_UNAVAILABLE',
] as const;

// Body produced by errorHandler for AppError subclasses
export const appErrorResponseSchema = z.object({
  message : z.string(),
  code    : z.enum([
    'BAD_REQUEST',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'NOT_FOUND',
    'CONFLICT',
    'PAYLOAD_TOO_LARGE',
    ...upstreamAuthErrorCodes,
  ]),
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
