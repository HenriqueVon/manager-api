import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialCurrencySchema,
  updateFinancialCurrencySchema,
  listFinancialCurrencyQuerySchema,
  financialCurrencySchema,
  listFinancialCurrencyResponseSchema,
} from './schemas';

const createFinancialCurrencyInput = openApiRegistry.register(
  'CreateFinancialCurrencyInput',
  createFinancialCurrencySchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialCurrencyInput = openApiRegistry.register(
  'UpdateFinancialCurrencyInput',
  updateFinancialCurrencySchema.openapi({ minProperties: 1 })
);

const financialCurrencyInputExample = {
  name   : 'EUROPEAN EURO',
  symbol : 'EUR',
};

const financialCurrencyExample = {
  id        : 'cm1234567890abcdefghijkl',
  name      : 'EUROPEAN EURO',
  symbol    : 'EUR',
  createdAt : '2026-01-01T00:00:00.000Z',
  updatedAt : '2026-01-01T00:00:00.000Z',
};

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/currencies',
  tags        : ['Financial Currencies'],
  summary     : 'List',
  operationId : 'listFinancialCurrency',
  request     : {
    query: listFinancialCurrencyQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialCurrency list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialCurrencyResponseSchema,
          example : { items: [financialCurrencyExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/financial/currencies',
  tags        : ['Financial Currencies'],
  summary     : 'Create',
  operationId : 'createFinancialCurrency',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialCurrencyInput,
          example : financialCurrencyInputExample,
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialCurrency created successfully',
      content     : {
        'application/json': {
          schema  : financialCurrencySchema,
          example : financialCurrencyExample,
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
  path        : '/financial/currencies/{id}',
  tags        : ['Financial Currencies'],
  summary     : 'Get by id',
  operationId : 'getFinancialCurrencyById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialCurrency returned successfully',
      content     : {
        'application/json': {
          schema  : financialCurrencySchema,
          example : financialCurrencyExample,
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
  path        : '/financial/currencies/{id}',
  tags        : ['Financial Currencies'],
  summary     : 'Update',
  operationId : 'updateFinancialCurrency',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialCurrencyInput,
          example : financialCurrencyInputExample,
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialCurrency updated successfully',
      content     : {
        'application/json': {
          schema  : financialCurrencySchema,
          example : financialCurrencyExample,
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
  path        : '/financial/currencies/{id}',
  tags        : ['Financial Currencies'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialCurrency',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialCurrency deleted successfully',
    },
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});
