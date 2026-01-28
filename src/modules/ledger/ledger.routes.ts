import { Router } from 'express';
import { controllerAdapter } from '../../shared/http/controller.adapter';
import { LedgerController } from './ledger.controller';

const router = Router();

router.get('/', controllerAdapter(LedgerController, 'list'));
router.get('/:id', controllerAdapter(LedgerController, 'getById'));
router.post('/', controllerAdapter(LedgerController, 'create'));
router.patch('/:id', controllerAdapter(LedgerController, 'update'));
router.delete('/:id', controllerAdapter(LedgerController, 'delete'));

export default router;