import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message : err.message,
      code    : err.code,
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
  });
}