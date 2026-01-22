import { Request, Response, NextFunction } from 'express';

export function controllerAdapter<T>(
  ControllerClass: new (...args: any[]) => T,
  methodName: keyof T
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const requestContainer = req.container;
      if (!requestContainer) {
        
        throw new Error('Request container not found. Is requestContainerMiddleware before this route?');
      }
      
      const controller = requestContainer.resolve<T>(ControllerClass);
      const handler = controller[methodName];

      if (typeof handler !== 'function') {
        throw new Error(`Controller method "${String(methodName)}" is not a function`);
      }
      
      await (handler as any).call(controller, req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
