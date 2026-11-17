import type { Request, Response, NextFunction } from 'express';
import { AppError, BadRequestError, PayloadTooLargeError, ResourcesInUseError, ResourcesNotFoundError, UpstreamAuthError } from '../../errors/app-error';

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

    if (err instanceof UpstreamAuthError && err.retryAfter !== undefined) {
      res.set('Retry-After', String(err.retryAfter));
    }

    return res.status(err.statusCode).json({
      message : err.message,
      code    : err.code,
      // The 404 and the 409 of a request for several records say which ones do not exist or are in use
      ...((err instanceof ResourcesNotFoundError || err instanceof ResourcesInUseError) && { ids: err.ids }),
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Internal server error',
  });
}