import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialEntryController } from './financial-entry.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { bulkDeleteSchema } from '@shared/schemas/bulk-delete.schema';
import {
  createFinancialEntrySchema,
  createFinancialEntryInstallmentsSchema,
  createFinancialEntryMonthlySchema,
  bulkPayFinancialEntrySchema,
  updateFinancialEntrySchema,
  listFinancialEntryQuerySchema,
  summaryFinancialEntryQuerySchema,
  summaryBreakdownFinancialEntryQuerySchema,
  agingFinancialEntryQuerySchema
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
  '/monthly',
  validateRequest({ body: createFinancialEntryMonthlySchema }),
  controllerAdapter(FinancialEntryController, 'createMonthly')
);

router.post(
  '/bulk-delete',
  validateRequest({ body: bulkDeleteSchema }),
  controllerAdapter(FinancialEntryController, 'bulkDelete')
);

router.post(
  '/bulk-pay',
  validateRequest({ body: bulkPayFinancialEntrySchema }),
  controllerAdapter(FinancialEntryController, 'bulkPay')
);

router.get(
  '/summary',
  validateRequest({ query: summaryFinancialEntryQuerySchema }),
  controllerAdapter(FinancialEntryController, 'summary')
);

router.get(
  '/summary/by-month',
  validateRequest({ query: summaryBreakdownFinancialEntryQuerySchema }),
  controllerAdapter(FinancialEntryController, 'summaryByMonth')
);

router.get(
  '/summary/by-category',
  validateRequest({ query: summaryBreakdownFinancialEntryQuerySchema }),
  controllerAdapter(FinancialEntryController, 'summaryByCategory')
);

router.get(
  '/summary/aging',
  validateRequest({ query: agingFinancialEntryQuerySchema }),
  controllerAdapter(FinancialEntryController, 'aging')
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
