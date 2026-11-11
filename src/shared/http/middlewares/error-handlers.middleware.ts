import type { Request, Response, NextFunction } from 'express';
import { AppError, BadRequestError, PayloadTooLargeError } from '../../errors/app-error';

// Errors raised by the JSON body parser (express.json()) carry a `type`; any other type stays unexpected
function fromBodyParserError(err: unknown): unknown {
  const type = (err as { type?: unknown } | null)?.type;

  if (type === 'entity.parse.failed') {
    return new BadRequestError('Malformed JSON body');
  }

  if (type === 'entity.too.large') {
    return new PayloadTooLargeError();
  }

  return err;
}

export function errorHandler(
  originalError: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const err = fromBodyParserError(originalError);

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