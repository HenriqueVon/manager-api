import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialFundSchema,
  updateFinancialFundSchema,
  listFinancialFundQuerySchema,
  financialFundSchema,
  listFinancialFundResponseSchema,
} from './schemas';

const createFinancialFundInput = openApiRegistry.register(
  'CreateFinancialFundInput',
  createFinancialFundSchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialFundInput = openApiRegistry.register(
  'UpdateFinancialFundInput',
  updateFinancialFundSchema.openapi({ minProperties: 1 })
);

const financialFundInputExample = {
  name                : 'BASIC EXPENSES',
  balance             : 0,
  ledgerId            : 'cm1234567890abcdefghijkl',
  financialCurrencyId : 'cm1234567890abcdefghijkl',
};

const financialFundExample = {
  id                  : 'cm1234567890abcdefghijkl',
  name                : 'BASIC EXPENSES',
  balance             : '0',
  financialCurrencyId : 'cm1234567890abcdefghijkl',
  ledgerId            : 'cm1234567890abcdefghijkl',
  createdAt           : '2026-01-01T00:00:00.000Z',
  updatedAt           : '2026-01-01T00:00:00.000Z',
};

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/funds',
  tags        : ['Financial Funds'],
  summary     : 'List',
  operationId : 'listFinancialFund',
  request     : {
    query: listFinancialFundQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialFund list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialFundResponseSchema,
          example : { items: [financialFundExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/financial/funds',
  tags        : ['Financial Funds'],
  summary     : 'Create',
  operationId : 'createFinancialFund',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialFundInput,
          example : financialFundInputExample,
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialFund created successfully',
      content     : {
        'application/json': {
          schema  : financialFundSchema,
          example : financialFundExample,
        },
      },
    },
    400 : responseRef('ValidationError'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/funds/{id}',
  tags        : ['Financial Funds'],
  summary     : 'Get by id',
  operationId : 'getFinancialFundById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialFund returned successfully',
      content     : {
        'application/json': {
          schema  : financialFundSchema,
          example : financialFundExample,
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
  path        : '/financial/funds/{id}',
  tags        : ['Financial Funds'],
  summary     : 'Update',
  operationId : 'updateFinancialFund',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialFundInput,
          example : financialFundInputExample,
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialFund updated successfully',
      content     : {
        'application/json': {
          schema  : financialFundSchema,
          example : financialFundExample,
        },
      },
    },
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'delete',
  path        : '/financial/funds/{id}',
  tags        : ['Financial Funds'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialFund',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialFund deleted successfully',
    },
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});
