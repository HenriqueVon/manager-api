import { Router } from 'express';

const basePath = '/v1/api';
const router = Router();

import ledgerRoute from '@modules/ledger/ledger.routes';
router.use(`${basePath}/ledgers`, ledgerRoute);

import financialCurrencyRoute from '@modules/financial/financial-currency/financial-currency.routes';
router.use(`${basePath}/financial/currencies`, financialCurrencyRoute);

import financialDescriptionRoute from '@modules/financial/financial-description/financial-description.routes';
router.use(`${basePath}/financial/descriptions`, financialDescriptionRoute);

import financialPaymentMethodRoute from '@modules/financial/financial-payment-method/financial-payment-method.routes';
router.use(`${basePath}/financial/payment-methods`, financialPaymentMethodRoute);

import financialBankAccountRoute from '@modules/financial/financial-bank-account/financial-bank-account.routes';
router.use(`${basePath}/financial/bank-accounts`, financialBankAccountRoute);
export default router;