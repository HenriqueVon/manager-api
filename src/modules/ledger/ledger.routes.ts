import { Router } from 'express';
import { controllerAdapter } from '@shared/http/controller.adapter';
import { validateRequest } from '@shared/http/middlewares/validate.middleware';
import { LedgerController } from './ledger.controller';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createLedgerSchema,
  updateLedgerSchema,
  listLedgerQuerySchema
} from './schemas';

const router = Router();

router.get(
  '/',
  validateRequest({ query: listLedgerQuerySchema }),
  controllerAdapter(LedgerController, 'list')
);

router.post(
  '/', 
  validateRequest({ body: createLedgerSchema }),
  controllerAdapter(LedgerController, 'create')
);
router.get(
  '/:id', 
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(LedgerController, 'getById')
);
router.patch(
  '/:id', 
  validateRequest({ params: idParamsSchema, body: updateLedgerSchema }),
  controllerAdapter(LedgerController, 'update')
);
router.delete(
  '/:id', 
  validateRequest({ params: idParamsSchema }),
  controllerAdapter(LedgerController, 'delete')
);

export default router;