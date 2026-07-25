import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialPaymentMethodController } from './financial-payment-method.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialPaymentMethodSchema,
  updateFinancialPaymentMethodSchema,
  listFinancialPaymentMethodQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialPaymentMethodQuerySchema }),
  controllerAdapter(FinancialPaymentMethodController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialPaymentMethodSchema }),
  controllerAdapter(FinancialPaymentMethodController, 'create')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialPaymentMethodController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialPaymentMethodSchema }),
  controllerAdapter(FinancialPaymentMethodController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialPaymentMethodController, 'delete')
);

export default router;
