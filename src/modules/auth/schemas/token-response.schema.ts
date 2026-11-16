import { z } from 'zod';

// Tokens issued by the authentication API, returned as they are
export const tokenResponseSchema = z.object({
  accessToken  : z.string(),
  tokenType    : z.string(),
  expiresIn    : z.number().int().openapi({ description: 'Lifetime of the access token, in seconds' }),
  refreshToken : z.string(),
});
