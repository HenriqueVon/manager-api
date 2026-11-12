import { z } from 'zod';

// Body of POST /auth/exchange-code. The rules are the ones of the authentication API.
export const exchangeCodeSchema = z.object({
  code: z.string().min(1).max(256)
    .openapi({ description: 'The single-use `code` received on the redirect URL of the social login' }),
  codeVerifier: z.string()
    .regex(/^[A-Za-z0-9._~-]{43,128}$/, 'codeVerifier must be 43 to 128 characters of [A-Za-z0-9-._~]')
    .openapi({ description: 'PKCE verifier whose SHA-256 was sent as `code_challenge` at the start of the login' }),
  redirectUri: z.string().min(1).max(2048)
    .openapi({ description: 'The same `redirect_uri` sent at the start of the login' }),
}).strict();
