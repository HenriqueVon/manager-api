import { z } from 'zod';

// Body of POST /auth/refresh, /auth/logout and /auth/logout-all
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).max(512, 'Refresh token must have at most 512 characters'),
}).strict();
