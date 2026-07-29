import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialFundController } from './financial-fund.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialFundSchema,
  updateFinancialFundSchema,
  listFinancialFundQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialFundQuerySchema }),
  controllerAdapter(FinancialFundController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialFundSchema }),
  controllerAdapter(FinancialFundController, 'create')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialFundController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialFundSchema }),
  controllerAdapter(FinancialFundController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialFundController, 'delete')
);

export default router;
