import { Router } from 'express';

const basePath = '/v1/api';
const router = Router();

import ledgerRoute from './modules/ledger/ledger.routes';
router.use(`${basePath}/ledgers`, ledgerRoute);

export default router;