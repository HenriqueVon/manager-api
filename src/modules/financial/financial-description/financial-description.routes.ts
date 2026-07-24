import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { FinancialDescriptionController } from './financial-description.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialDescriptionSchema,
  updateFinancialDescriptionSchema,
  listFinancialDescriptionQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listFinancialDescriptionQuerySchema }),
  controllerAdapter(FinancialDescriptionController, 'list')
);

router.post(
  '/',
  validateRequest({ body: createFinancialDescriptionSchema }),
  controllerAdapter(FinancialDescriptionController, 'create')
);

router.get(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialDescriptionController, 'getById')
);

router.patch(
  '/:id',
  validateRequest({ params: idParamsSchema, body: updateFinancialDescriptionSchema }),
  controllerAdapter(FinancialDescriptionController, 'update')
);

router.delete(
  '/:id',
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(FinancialDescriptionController, 'delete')
);

export default router;
