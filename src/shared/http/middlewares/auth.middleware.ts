import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '@services/auth/auth.service';

export function authMiddleware(req: Request,_res: Response,next: NextFunction) {
  const authService = new AuthService();

  authService
    .authenticate(req.header('authorization'))
    .then(() => next())
    .catch(next);  
}