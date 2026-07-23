import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialCurrencySchema,
  updateFinancialCurrencySchema,
  listFinancialCurrencyQuerySchema,
  financialCurrencySchema,
  listFinancialCurrencyResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialCurrency',
  financialCurrencySchema
);

openApiRegistry.register(
  'CreateFinancialCurrencyInput',
  createFinancialCurrencySchema
);

openApiRegistry.register(
  'UpdateFinancialCurrencyInput',
  updateFinancialCurrencySchema
);

openApiRegistry.register(
  'ListFinancialCurrencyQuery',
  listFinancialCurrencyQuerySchema
);

openApiRegistry.register(
  'ListFinancialCurrencyResponse',
  listFinancialCurrencyResponseSchema
);

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/currencies',
  tags        : ['Financial Currencies'],
  summary     : 'List financial/currencies',
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
          example : {
            'items': [
              {
                'id'        : 'cm1234567890abcdefghijkl',
                'name'      : 'EUROPEAN EURO',
                'symbol'    : 'EUR',
                'createdAt' : '2026-01-01T00:00:00.000Z',
                'updatedAt' : '2026-01-01T00:00:00.000Z'
              }
            ],
            'total': 1
          },
        },
      },
    },
    400: {
      description : 'Invalid query parameters',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description : 'Unauthorized',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },    
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/financial/currencies',
  tags        : ['Financial Currencies'],
  summary     : 'Create FinancialCurrency',
  operationId : 'createFinancialCurrency',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialCurrencySchema,
          example : {
            'name'   : 'EUROPEAN EURO',
            'symbol' : 'EUR'
          },
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
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'EUROPEAN EURO',
            'symbol'    : 'EUR',
            'createdAt' : '2026-01-01T00:00:00.000Z',
            'updatedAt' : '2026-01-01T00:00:00.000Z'
          },
        },
      },
    },
    400: {
      description : 'Invalid request body',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description : 'Unauthorized',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },       
    409: {
      description : 'FinancialCurrency already exists',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/currencies/{id}',
  tags        : ['Financial Currencies'],
  summary     : 'Get FinancialCurrency by id',
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
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'EUROPEAN EURO',
            'symbol'    : 'EUR',
            'createdAt' : '2026-01-01T00:00:00.000Z',
            'updatedAt' : '2026-01-01T00:00:00.000Z'
          },
        },
      },
    },
    400: {
      description : 'Invalid id',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description : 'Unauthorized',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },       
    404: {
      description : 'FinancialCurrency not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method      : 'patch',
  path        : '/financial/currencies/{id}',
  tags        : ['Financial Currencies'],
  summary     : 'Update FinancialCurrency',
  operationId : 'updateFinancialCurrency',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialCurrencySchema,
          example : {
            'name'   : 'EUROPEAN EURO',
            'symbol' : 'EUR'
          },
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
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'EUROPEAN EURO',
            'symbol'    : 'EUR',
            'createdAt' : '2026-01-01T00:00:00.000Z',
            'updatedAt' : '2026-01-01T00:00:00.000Z'
          },
        },
      },
    },
    400: {
      description : 'Invalid request',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description : 'Unauthorized',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },       
    404: {
      description : 'FinancialCurrency not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialCurrency already exists',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

openApiRegistry.registerPath({
  method      : 'delete',
  path        : '/financial/currencies/{id}',
  tags        : ['Financial Currencies'],
  summary     : 'Delete FinancialCurrency',
  operationId : 'deleteFinancialCurrency',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialCurrency deleted successfully',
    },
    400: {
      description : 'Invalid id',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    401: {
      description : 'Unauthorized',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },       
    404: {
      description : 'FinancialCurrency not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
