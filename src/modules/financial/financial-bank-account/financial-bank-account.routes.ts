import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialBankAccountController } from './financial-bank-account.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialBankAccountSchema,
  updateFinancialBankAccountSchema,
  listFinancialBankAccountQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialBankAccountQuerySchema }),
  controllerAdapter(FinancialBankAccountController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialBankAccountSchema }),
  controllerAdapter(FinancialBankAccountController, 'create')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialBankAccountController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialBankAccountSchema }),
  controllerAdapter(FinancialBankAccountController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialBankAccountController, 'delete')
);

export default router;
