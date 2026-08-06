import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialFundSchema,
  updateFinancialFundSchema,
  listFinancialFundQuerySchema,
  financialFundSchema,
  listFinancialFundResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialFund',
  financialFundSchema
);

openApiRegistry.register(
  'CreateFinancialFundInput',
  createFinancialFundSchema
);

openApiRegistry.register(
  'UpdateFinancialFundInput',
  updateFinancialFundSchema
);

openApiRegistry.register(
  'ListFinancialFundQuery',
  listFinancialFundQuerySchema
);

openApiRegistry.register(
  'ListFinancialFundResponse',
  listFinancialFundResponseSchema
);

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
          example : {
            'items': [
              {
                'id'                  : 'cm1234567890abcdefghijkl',
                'name'                : 'BASIC EXPENSES',
                'balance'             : 0,
                'ledgerId'            : 'cm1234567890abcdefghijkl',
                'financialCurrencyId' : 'jj1234567543abcdefghipui',
                'createdAt'           : '2026-01-01T00:00:00.000Z',
                'updatedAt'           : '2026-01-01T00:00:00.000Z'
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
  path        : '/financial/funds',
  tags        : ['Financial Funds'],
  summary     : 'Create',
  operationId : 'createFinancialFund',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialFundSchema,
          example : {
            'name'                : 'BASIC EXPENSES',
            'balance'             : 0,
            'ledgerId'            : 'cm1234567890abcdefghijkl',
            'financialCurrencyId' : 'jj1234567543abcdefghipui'
          },
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
          example : {
            'id'                  : 'cm1234567890abcdefghijkl',
            'name'                : 'BASIC EXPENSES',
            'balance'             : 0,
            'ledgerId'            : 'cm1234567890abcdefghijkl',
            'financialCurrencyId' : 'jj1234567543abcdefghipui',
            'createdAt'           : '2026-01-01T00:00:00.000Z',
            'updatedAt'           : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialFund already exists',
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
          example : {
            'id'                  : 'cm1234567890abcdefghijkl',
            'name'                : 'BASIC EXPENSES',
            'balance'             : 0,
            'ledgerId'            : 'cm1234567890abcdefghijkl',
            'financialCurrencyId' : 'jj1234567543abcdefghipui',
            'createdAt'           : '2026-01-01T00:00:00.000Z',
            'updatedAt'           : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialFund not found',
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
          schema  : updateFinancialFundSchema,
          example : {
            'name'                : 'BASIC EXPENSES',
            'balance'             : 0,
            'ledgerId'            : 'cm1234567890abcdefghijkl',
            'financialCurrencyId' : 'jj1234567543abcdefghipui'
          },
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
          example : {
            'id'                  : 'cm1234567890abcdefghijkl',
            'name'                : 'BASIC EXPENSES',
            'balance'             : 0,
            'ledgerId'            : 'cm1234567890abcdefghijkl',
            'financialCurrencyId' : 'jj1234567543abcdefghipui',
            'createdAt'           : '2026-01-01T00:00:00.000Z',
            'updatedAt'           : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialFund not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialFund already exists',
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
      description : 'FinancialFund not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
