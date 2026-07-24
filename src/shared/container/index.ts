import { container } from 'tsyringe';

import { LedgerRepository } from '@modules/ledger/repositories/ledger.repository';
import { ILedgerRepository } from '@modules/ledger/repositories/iledger.repository';
import { LEDGER_REPOSITORY } from '@modules/ledger/repositories/ledger.tokens';
container.registerSingleton<ILedgerRepository>(LEDGER_REPOSITORY, LedgerRepository);


import { FinancialCurrencyRepository } from '@modules/financial/financial-currency/repositories/financial-currency.repository';
import { IFinancialCurrencyRepository } from '@modules/financial/financial-currency/repositories/ifinancial-currency.repository';
import { FINANCIAL_CURRENCY_REPOSITORY } from '@modules/financial/financial-currency/repositories/financial-currency.tokens';
container.registerSingleton<IFinancialCurrencyRepository>(FINANCIAL_CURRENCY_REPOSITORY, FinancialCurrencyRepository);

import { FinancialDescriptionRepository } from '@modules/financial/financial-description/repositories/financial-description.repository';
import { IFinancialDescriptionRepository } from '@modules/financial/financial-description/repositories/ifinancial-description.repository';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '@modules/financial/financial-description/repositories/financial-description.tokens';
container.registerSingleton<IFinancialDescriptionRepository>(FINANCIAL_DESCRIPTION_REPOSITORY, FinancialDescriptionRepository);
