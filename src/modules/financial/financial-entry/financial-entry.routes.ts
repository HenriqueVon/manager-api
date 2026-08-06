import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialEntryController } from './financial-entry.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialEntrySchema,
  updateFinancialEntrySchema,
  listFinancialEntryQuerySchema
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
