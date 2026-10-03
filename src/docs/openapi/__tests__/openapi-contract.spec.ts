import './test-env';
import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { container } from 'tsyringe';
import { Prisma } from '@prisma/client';
import type { ZodType } from 'zod';
import routes from '../../../routes';
import { errorHandler, requestContainerMiddleware } from '@shared/http/middlewares';
import { createOpenApiDocument } from '../document';
import { API_BASE_PATH } from './helpers';

import { LEDGER_REPOSITORY } from '@modules/ledger/repositories/ledger.tokens';
import { FINANCIAL_CURRENCY_REPOSITORY } from '@modules/financial/financial-currency/repositories/financial-currency.tokens';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '@modules/financial/financial-description/repositories/financial-description.tokens';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '@modules/financial/financial-payment-method/repositories/financial-payment-method.tokens';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '@modules/financial/financial-bank-account/repositories/financial-bank-account.tokens';
import { FINANCIAL_FUND_REPOSITORY } from '@modules/financial/financial-fund/repositories/financial-fund.tokens';
import { FINANCIAL_CATEGORY_REPOSITORY } from '@modules/financial/financial-category/repositories/financial-category.tokens';
import { FINANCIAL_ENTRY_REPOSITORY } from '@modules/financial/financial-entry/repositories/financial-entry.tokens';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '@modules/financial/financial-fund-transaction/repositories/financial-fund-transaction.tokens';

import { ledgerSchema, listLedgerResponseSchema } from '@modules/ledger/schemas';
import { financialCurrencySchema, listFinancialCurrencyResponseSchema } from '@modules/financial/financial-currency/schemas';
import { financialDescriptionSchema, listFinancialDescriptionResponseSchema } from '@modules/financial/financial-description/schemas';
import { financialPaymentMethodSchema, listFinancialPaymentMethodResponseSchema } from '@modules/financial/financial-payment-method/schemas';
import { financialBankAccountSchema, listFinancialBankAccountResponseSchema } from '@modules/financial/financial-bank-account/schemas';
import { financialFundSchema, listFinancialFundResponseSchema } from '@modules/financial/financial-fund/schemas';
import { financialCategorySchema, listFinancialCategoryResponseSchema } from '@modules/financial/financial-category/schemas';
import { financialEntrySchema, listFinancialEntryResponseSchema } from '@modules/financial/financial-entry/schemas';
import { financialFundTransactionSchema, listFinancialFundTransactionResponseSchema } from '@modules/financial/financial-fund-transaction/schemas';

// Runs every documented operation through the real route → validation → controller → use case
// pipeline, with repositories replaced by mocks that return Prisma-like records (Decimal, Date).
// The response must use the documented success status and match the documented example and schema.

type ModuleContract = {
  model: string;
  token: string;
  path: string;
  entitySchema: ZodType;
  listSchema: ZodType;
};

const modules: ModuleContract[] = [
  { model: 'Ledger', token: LEDGER_REPOSITORY, path: '/ledgers', entitySchema: ledgerSchema, listSchema: listLedgerResponseSchema },
  { model: 'FinancialCurrency', token: FINANCIAL_CURRENCY_REPOSITORY, path: '/financial/currencies', entitySchema: financialCurrencySchema, listSchema: listFinancialCurrencyResponseSchema },
  { model: 'FinancialDescription', token: FINANCIAL_DESCRIPTION_REPOSITORY, path: '/financial/descriptions', entitySchema: financialDescriptionSchema, listSchema: listFinancialDescriptionResponseSchema },
  { model: 'FinancialPaymentMethod', token: FINANCIAL_PAYMENT_METHOD_REPOSITORY, path: '/financial/payment-methods', entitySchema: financialPaymentMethodSchema, listSchema: listFinancialPaymentMethodResponseSchema },
  { model: 'FinancialBankAccount', token: FINANCIAL_BANK_ACCOUNT_REPOSITORY, path: '/financial/bank-accounts', entitySchema: financialBankAccountSchema, listSchema: listFinancialBankAccountResponseSchema },
  { model: 'FinancialFund', token: FINANCIAL_FUND_REPOSITORY, path: '/financial/funds', entitySchema: financialFundSchema, listSchema: listFinancialFundResponseSchema },
  { model: 'FinancialCategory', token: FINANCIAL_CATEGORY_REPOSITORY, path: '/financial/categories', entitySchema: financialCategorySchema, listSchema: listFinancialCategoryResponseSchema },
  { model: 'FinancialEntry', token: FINANCIAL_ENTRY_REPOSITORY, path: '/financial/entries', entitySchema: financialEntrySchema, listSchema: listFinancialEntryResponseSchema },
  { model: 'FinancialFundTransaction', token: FINANCIAL_FUND_TRANSACTION_REPOSITORY, path: '/financial/funds/transactions', entitySchema: financialFundTransactionSchema, listSchema: listFinancialFundTransactionResponseSchema },
];

const document = createOpenApiDocument() as any;

const app = express();
app.use(express.json());
app.use(requestContainerMiddleware);
app.use(routes);
app.use(errorHandler);

// Builds the record Prisma would return for the documented example (Decimal and Date instances)
function toPrismaRecord(model: string, example: Record<string, unknown>) {
  const fields = Prisma.dmmf.datamodel.models.find((m) => m.name === model)!.fields;

  return Object.fromEntries(Object.entries(example).map(([key, value]) => {
    const type = fields.find((field) => field.name === key)?.type;

    if (value !== null && type === 'Decimal') return [key, new Prisma.Decimal(value as string)];
    if (value !== null && type === 'DateTime') return [key, new Date(value as string)];
    return [key, value];
  }));
}

function repositoryMock(record: Record<string, unknown>) {
  return {
    create            : async () => record,
    findById          : async () => record,
    findByName        : async () => null,
    findByDescription : async () => null,
    // List use cases pass no filters; uniqueness checks pass filters and must find nothing
    findMany          : async (filters: Record<string, unknown> = {}) => (
      Object.keys(filters).length === 0 ? { items: [record], total: 1 } : { items: [], total: 0 }
    ),
    update : async () => record,
    delete : async () => undefined,
    exists : async () => true,
  };
}

function jsonExample(content: any) {
  return content?.['application/json']?.example;
}

describe.each(modules)('$model contract', ({ model, token, path, entitySchema, listSchema }) => {
  const itemPath = `${path}/{id}`;
  const entityExample = jsonExample(document.paths[itemPath].get.responses['200'].content);

  beforeAll(() => {
    container.register(token, { useValue: repositoryMock(toPrismaRecord(model, entityExample)) });
  });

  it.each([
    ['get', path, listSchema],
    ['post', path, entitySchema],
    ['get', itemPath, entitySchema],
    ['patch', itemPath, entitySchema],
    ['delete', itemPath, undefined],
  ] as const)('%s %s', async (method, operationPath, responseSchema) => {
    const operation = document.paths[operationPath][method];
    const [successStatus] = Object.keys(operation.responses).filter((status) => status.startsWith('2'));
    const url = `${API_BASE_PATH}${operationPath.replace('{id}', entityExample.id)}`;

    const res = await request(app)[method](url).send(jsonExample(operation.requestBody?.content));

    expect(res.status, JSON.stringify(res.body)).toBe(Number(successStatus));

    if (responseSchema) {
      expect(res.body).toEqual(jsonExample(operation.responses[successStatus].content));
      expect(responseSchema.safeParse(res.body).success).toBe(true);
    } else {
      expect(res.body).toEqual({});
    }
  });
});
