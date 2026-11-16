import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { AuthController } from './auth.controller';
import { exchangeCodeSchema, refreshTokenSchema } from './schemas';

const router = Router();

router.post(
  '/exchange-code',
  validateRequest({ body: exchangeCodeSchema }),
  controllerAdapter(AuthController, 'exchangeCode')
);

router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  controllerAdapter(AuthController, 'refresh')
);

router.post(
  '/logout',
  validateRequest({ body: refreshTokenSchema }),
  controllerAdapter(AuthController, 'logout')
);

router.post(
  '/logout-all',
  validateRequest({ body: refreshTokenSchema }),
  controllerAdapter(AuthController, 'logoutAll')
);

export default router;
