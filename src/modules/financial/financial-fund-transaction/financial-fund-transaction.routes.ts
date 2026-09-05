import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialFundTransactionController } from './financial-fund-transaction.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialFundTransactionSchema,
  updateFinancialFundTransactionSchema,
  listFinancialFundTransactionQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialFundTransactionQuerySchema }),
  controllerAdapter(FinancialFundTransactionController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialFundTransactionSchema }),
  controllerAdapter(FinancialFundTransactionController, 'create')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialFundTransactionController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialFundTransactionSchema }),
  controllerAdapter(FinancialFundTransactionController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialFundTransactionController, 'delete')
);

export default router;
