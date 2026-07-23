import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialCurrencyController } from './financial-currency.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialCurrencySchema,
  updateFinancialCurrencySchema,
  listFinancialCurrencyQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialCurrencyQuerySchema }),
  controllerAdapter(FinancialCurrencyController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialCurrencySchema }),
  controllerAdapter(FinancialCurrencyController, 'create')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialCurrencyController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialCurrencySchema }),
  controllerAdapter(FinancialCurrencyController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialCurrencyController, 'delete')
);

export default router;
