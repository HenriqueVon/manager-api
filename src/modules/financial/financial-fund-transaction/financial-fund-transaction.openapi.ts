import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialFundTransactionSchema,
  updateFinancialFundTransactionSchema,
  listFinancialFundTransactionQuerySchema,
  financialFundTransactionSchema,
  listFinancialFundTransactionResponseSchema,
} from './schemas';

const createFinancialFundTransactionInput = openApiRegistry.register(
  'CreateFinancialFundTransactionInput',
  createFinancialFundTransactionSchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialFundTransactionInput = openApiRegistry.register(
  'UpdateFinancialFundTransactionInput',
  updateFinancialFundTransactionSchema.openapi({ minProperties: 1 })
);

const financialFundTransactionInputExample = {
  transactionDate        : '2026-01-01',
  amountCredit           : 100,
  amountDebit            : 0,
  additionalDescription  : '1/10 - Rent payment for January 2026',
  ledgerId               : 'cm1234567890abcdefghijkl',
  financialDescriptionId : 'cm1234567890abcdefghijkl',
  financialFundId        : 'cm1234567890abcdefghijkl',
  financialCategoryId    : 'cm1234567890abcdefghijkl',
  financialBankAccountId : 'cm1234567890abcdefghijkl',
};

const financialFundTransactionExample = {
  id                     : 'cm1234567890abcdefghijkl',
  transactionDate        : '2026-01-01T00:00:00.000Z',
  amountCredit           : '100',
  amountDebit            : '0',
  additionalDescription  : '1/10 - Rent payment for January 2026',
  ledgerId               : 'cm1234567890abcdefghijkl',
  financialDescriptionId : 'cm1234567890abcdefghijkl',
  financialFundId        : 'cm1234567890abcdefghijkl',
  financialCategoryId    : 'cm1234567890abcdefghijkl',
  financialBankAccountId : 'cm1234567890abcdefghijkl',
  createdAt              : '2026-01-01T00:00:00.000Z',
  updatedAt              : '2026-01-01T00:00:00.000Z',
};

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/funds/transactions',
  tags        : ['Financial Fund Transactions'],
  summary     : 'List',
  operationId : 'listFinancialFundTransaction',
  request     : {
    query: listFinancialFundTransactionQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialFundTransaction list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialFundTransactionResponseSchema,
          example : { items: [financialFundTransactionExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/financial/funds/transactions',
  tags        : ['Financial Fund Transactions'],
  summary     : 'Create',
  operationId : 'createFinancialFundTransaction',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialFundTransactionInput,
          example : financialFundTransactionInputExample,
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialFundTransaction created successfully',
      content     : {
        'application/json': {
          schema  : financialFundTransactionSchema,
          example : financialFundTransactionExample,
        },
      },
    },
    400 : responseRef('ValidationOrBusinessRuleError'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/funds/transactions/{id}',
  tags        : ['Financial Fund Transactions'],
  summary     : 'Get by id',
  operationId : 'getFinancialFundTransactionById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialFundTransaction returned successfully',
      content     : {
        'application/json': {
          schema  : financialFundTransactionSchema,
          example : financialFundTransactionExample,
        },
      },
    },
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'patch',
  path        : '/financial/funds/transactions/{id}',
  tags        : ['Financial Fund Transactions'],
  summary     : 'Update',
  operationId : 'updateFinancialFundTransaction',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialFundTransactionInput,
          example : financialFundTransactionInputExample,
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialFundTransaction updated successfully',
      content     : {
        'application/json': {
          schema  : financialFundTransactionSchema,
          example : financialFundTransactionExample,
        },
      },
    },
    400 : responseRef('ValidationOrBusinessRuleError'),
    404 : responseRef('NotFound'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'delete',
  path        : '/financial/funds/transactions/{id}',
  tags        : ['Financial Fund Transactions'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialFundTransaction',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialFundTransaction deleted successfully',
    },
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});
