import type { RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

function sendZodError(res: Response, error: any, message: string) {
  const formatted = error.format?.();
  const issues = error.issues?.map((i: any) => ({
    path    : i.path?.join('.') ?? '',
    message : i.message,
    code    : i.code,
  }));

  return res.status(400).json({
    message,
    errors : formatted ?? error,
    issues : issues ?? [],
  });
}

export function validateRequest(
  schemas: ValidationSchemas
): RequestHandler {
  return (req, res, next) => {
    if (schemas.params) {
      const r = schemas.params.safeParse(req.params);
      if (!r.success) {
        return sendZodError(res, r.error, 'Invalid params');
      }
      req.params = r.data as any;
    }

    if (schemas.query) {
      const r = schemas.query.safeParse(req.query);
      if (!r.success) {
        return sendZodError(res, r.error, 'Invalid query');
      }
      req.query = r.data as any;
    }

    if (schemas.body) {
      const r = schemas.body.safeParse(req.body);
      if (!r.success) {
        return sendZodError(res, r.error, 'Invalid body');
      }
      req.body = r.data as any;
    }

    next();
  };
}