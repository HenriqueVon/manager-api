import type { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { randomUUID } from 'crypto';

export function requestContainerMiddleware(req: Request, _res: Response, next: NextFunction) {
  req.requestId = req.requestId ?? randomUUID();
  
  // Each request receives an isolated DI container
  // to avoid shared state and side effects between requests
  req.container = container.createChildContainer();
  next();
}
