import type { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';

export function requestContainerMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.requestId = req.requestId ?? randomUUID();
  req.container = container.createChildContainer();

  next();
}
