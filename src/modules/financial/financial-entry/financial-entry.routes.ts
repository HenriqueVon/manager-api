import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialEntryController } from './financial-entry.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { bulkDeleteSchema } from '@shared/schemas/bulk-delete.schema';
import {
  createFinancialEntrySchema,
  createFinancialEntryInstallmentsSchema,
  updateFinancialEntrySchema,
  listFinancialEntryQuerySchema,
  summaryFinancialEntryQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialEntryQuerySchema }),
  controllerAdapter(FinancialEntryController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialEntrySchema }),
  controllerAdapter(FinancialEntryController, 'create')
);

router.post(
  '/installments',
  validateRequest({ body: createFinancialEntryInstallmentsSchema }),
  controllerAdapter(FinancialEntryController, 'createInstallments')
);

router.post(
  '/bulk-delete',
  validateRequest({ body: bulkDeleteSchema }),
  controllerAdapter(FinancialEntryController, 'bulkDelete')
);

router.get(
  '/summary',
  validateRequest({ query: summaryFinancialEntryQuerySchema }),
  controllerAdapter(FinancialEntryController, 'summary')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialEntryController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialEntrySchema }),
  controllerAdapter(FinancialEntryController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialEntryController, 'delete')
);

export default router;
