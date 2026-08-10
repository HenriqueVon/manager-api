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

import financialFundTransactionRoute from '@modules/financial/financial-fund-transaction/financial-fund-transaction.routes';
router.use(`${basePath}/financial/funds/transactions`, financialFundTransactionRoute);

import financialFundRoute from '@modules/financial/financial-fund/financial-fund.routes';
router.use(`${basePath}/financial/funds`, financialFundRoute);

import financialCategoryRoute from '@modules/financial/financial-category/financial-category.routes';
router.use(`${basePath}/financial/categories`, financialCategoryRoute);

import financialEntryRoute from '@modules/financial/financial-entry/financial-entry.routes';
router.use(`${basePath}/financial/entries`, financialEntryRoute); 


export default router;