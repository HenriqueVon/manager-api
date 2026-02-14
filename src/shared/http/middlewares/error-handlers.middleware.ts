import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/app-error';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    console.warn({ code: err.code, message: err.message, path: req.path, method: req.method });

    return res.status(err.statusCode).json({
      message : err.message,
      code    : err.code,
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Internal server error',
  });
}