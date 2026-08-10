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

import { FinancialPaymentMethodRepository } from '@modules/financial/financial-payment-method/repositories/financial-payment-method.repository';
import { IFinancialPaymentMethodRepository } from '@modules/financial/financial-payment-method/repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '@modules/financial/financial-payment-method/repositories/financial-payment-method.tokens';
container.registerSingleton<IFinancialPaymentMethodRepository>(FINANCIAL_PAYMENT_METHOD_REPOSITORY, FinancialPaymentMethodRepository);

import { FinancialBankAccountRepository } from '@modules/financial/financial-bank-account/repositories/financial-bank-account.repository';
import { IFinancialBankAccountRepository } from '@modules/financial/financial-bank-account/repositories/ifinancial-bank-account.repository';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '@modules/financial/financial-bank-account/repositories/financial-bank-account.tokens';
container.registerSingleton<IFinancialBankAccountRepository>(FINANCIAL_BANK_ACCOUNT_REPOSITORY, FinancialBankAccountRepository);

import { FinancialFundRepository } from '@modules/financial/financial-fund/repositories/financial-fund.repository';
import { IFinancialFundRepository } from '@modules/financial/financial-fund/repositories/ifinancial-fund.repository';
import { FINANCIAL_FUND_REPOSITORY } from '@modules/financial/financial-fund/repositories/financial-fund.tokens';
container.registerSingleton<IFinancialFundRepository>(FINANCIAL_FUND_REPOSITORY, FinancialFundRepository);

import { FinancialCategoryRepository } from '@modules/financial/financial-category/repositories/financial-category.repository';
import { IFinancialCategoryRepository } from '@modules/financial/financial-category/repositories/ifinancial-category.repository';
import { FINANCIAL_CATEGORY_REPOSITORY } from '@modules/financial/financial-category/repositories/financial-category.tokens';
container.registerSingleton<IFinancialCategoryRepository>(FINANCIAL_CATEGORY_REPOSITORY, FinancialCategoryRepository);

import { FinancialEntryRepository } from '@modules/financial/financial-entry/repositories/financial-entry.repository';
import { IFinancialEntryRepository } from '@modules/financial/financial-entry/repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '@modules/financial/financial-entry/repositories/financial-entry.tokens';
container.registerSingleton<IFinancialEntryRepository>(FINANCIAL_ENTRY_REPOSITORY, FinancialEntryRepository);

import { FinancialFundTransactionRepository } from '@modules/financial/financial-fund-transaction/repositories/financial-fund-transaction.repository';
import { IFinancialFundTransactionRepository } from '@modules/financial/financial-fund-transaction/repositories/ifinancial-fund-transaction.repository';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '@modules/financial/financial-fund-transaction/repositories/financial-fund-transaction.tokens';
container.registerSingleton<IFinancialFundTransactionRepository>(FINANCIAL_FUND_TRANSACTION_REPOSITORY, FinancialFundTransactionRepository);
