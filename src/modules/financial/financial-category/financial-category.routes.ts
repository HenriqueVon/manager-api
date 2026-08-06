import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialCategoryController } from './financial-category.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialCategorySchema,
  updateFinancialCategorySchema,
  listFinancialCategoryQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialCategoryQuerySchema }),
  controllerAdapter(FinancialCategoryController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialCategorySchema }),
  controllerAdapter(FinancialCategoryController, 'create')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialCategoryController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialCategorySchema }),
  controllerAdapter(FinancialCategoryController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialCategoryController, 'delete')
);

export default router;
