import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialBankAccountSchema,
  updateFinancialBankAccountSchema,
  listFinancialBankAccountQuerySchema,
  financialBankAccountSchema,
  listFinancialBankAccountResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialBankAccount',
  financialBankAccountSchema
);

openApiRegistry.register(
  'CreateFinancialBankAccountInput',
  createFinancialBankAccountSchema
);

openApiRegistry.register(
  'UpdateFinancialBankAccountInput',
  updateFinancialBankAccountSchema
);

openApiRegistry.register(
  'ListFinancialBankAccountQuery',
  listFinancialBankAccountQuerySchema
);

openApiRegistry.register(
  'ListFinancialBankAccountResponse',
  listFinancialBankAccountResponseSchema
);

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/bank-accounts',
  tags        : ['Financial Bank Accounts'],
  summary     : 'List',
  operationId : 'listFinancialBankAccount',
  request     : {
    query: listFinancialBankAccountQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialBankAccount list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialBankAccountResponseSchema,
          example : {
            'items': [
              {
                'id'                  : 'cm1234567890abcdefghijkl',
                'name'                : 'REVOLUT',
                'type'                : 'PERSONAL',
                'balance'             : 1000,
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
  path        : '/financial/bank-accounts',
  tags        : ['Financial Bank Accounts'],
  summary     : 'Create',
  operationId : 'createFinancialBankAccount',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialBankAccountSchema,
          example : {
            'name'                : 'REVOLUT',
            'type'                : 'PERSONAL',
            'balance'             : 1000,
            'ledgerId'            : 'cm1234567890abcdefghijkl',
            'financialCurrencyId' : 'jj1234567543abcdefghipui'
          },
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialBankAccount created successfully',
      content     : {
        'application/json': {
          schema  : financialBankAccountSchema,
          example : {
            'id'                  : 'cm1234567890abcdefghijkl',
            'name'                : 'REVOLUT',
            'type'                : 'PERSONAL',
            'balance'             : 1000,
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
      description : 'FinancialBankAccount already exists',
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
  path        : '/financial/bank-accounts/{id}',
  tags        : ['Financial Bank Accounts'],
  summary     : 'Get by id',
  operationId : 'getFinancialBankAccountById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialBankAccount returned successfully',
      content     : {
        'application/json': {
          schema  : financialBankAccountSchema,
          example : {
            'id'                  : 'cm1234567890abcdefghijkl',
            'name'                : 'REVOLUT',
            'type'                : 'PERSONAL',
            'balance'             : 1000,
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
      description : 'FinancialBankAccount not found',
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
  path        : '/financial/bank-accounts/{id}',
  tags        : ['Financial Bank Accounts'],
  summary     : 'Update',
  operationId : 'updateFinancialBankAccount',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialBankAccountSchema,
          example : {
            'name'                : 'REVOLUT',
            'type'                : 'PERSONAL',
            'balance'             : 1000,
            'ledgerId'            : 'cm1234567890abcdefghijkl',
            'financialCurrencyId' : 'jj1234567543abcdefghipui'
          },
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialBankAccount updated successfully',
      content     : {
        'application/json': {
          schema  : financialBankAccountSchema,
          example : {
            'id'                  : 'cm1234567890abcdefghijkl',
            'name'                : 'REVOLUT',
            'type'                : 'PERSONAL',
            'balance'             : 1000,
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
      description : 'FinancialBankAccount not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialBankAccount already exists',
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
  path        : '/financial/bank-accounts/{id}',
  tags        : ['Financial Bank Accounts'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialBankAccount',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialBankAccount deleted successfully',
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
      description : 'FinancialBankAccount not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
