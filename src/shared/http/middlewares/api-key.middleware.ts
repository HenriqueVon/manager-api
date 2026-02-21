import type { Request, Response, NextFunction } from 'express';
import { env } from '@config/env';
import { safeCompare } from '@shared/security/safe-compare';

import { 
  Unauthorized,
  Forbidden
}  from '@shared/errors/app-error';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  const provided = req.header('x-api-key');

  if (!provided) {
    throw new Unauthorized('Missing x-api-key header');
  }

  // Prevent timing attacks when comparing secret values
  if (!safeCompare(provided, env.apiKey)) {
    throw new Forbidden('Invalid API key');
  }

  return next();
}