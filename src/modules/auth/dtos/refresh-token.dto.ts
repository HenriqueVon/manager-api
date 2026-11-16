import { z } from 'zod';
import { refreshTokenSchema } from '../schemas/refresh-token.schema';

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
