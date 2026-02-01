import 'express';
import type { DependencyContainer } from 'tsyringe';

declare global {
  namespace Express {
    export interface Request {      
      requestId: string | undefined,
      container?: DependencyContainer; 
    }
  }
}