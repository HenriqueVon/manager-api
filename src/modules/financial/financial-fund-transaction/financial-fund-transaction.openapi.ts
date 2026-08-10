import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialFundTransactionSchema,
  updateFinancialFundTransactionSchema,
  listFinancialFundTransactionQuerySchema,
  financialFundTransactionSchema,
  listFinancialFundTransactionResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialFundTransaction',
  financialFundTransactionSchema
);

openApiRegistry.register(
  'CreateFinancialFundTransactionInput',
  createFinancialFundTransactionSchema
);

openApiRegistry.register(
  'UpdateFinancialFundTransactionInput',
  updateFinancialFundTransactionSchema
);

openApiRegistry.register(
  'ListFinancialFundTransactionQuery',
  listFinancialFundTransactionQuerySchema
);

openApiRegistry.register(
  'ListFinancialFundTransactionResponse',
  listFinancialFundTransactionResponseSchema
);

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
          example : {
            'items': [
              {
                'id'                     : 'cm1234567890abcdefghijkl',
                'transactionDate'        : '2026-01-01',
                'amountCredit'           : 100,
                'amountDebit'            : 0,
                'additionalDescription'  : '1/10 - Rent payment for January 2026',
                'ledgerId'               : 'cm1234567890abcdefghijkl',
                'financialDescriptionId' : 'cm1234567890abcdefghijkl',
                'financialFundId'        : 'cm1234567890abcdefghijkl',
                'financialCategoryId'    : 'cm1234567890abcdefghijkl',
                'financialBankAccountId' : 'cm1234567890abcdefghijkl',
                'createdAt'              : '2026-01-01T00:00:00.000Z',
                'updatedAt'              : '2026-01-01T00:00:00.000Z'
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
  path        : '/financial/funds/transactions',
  tags        : ['Financial Fund Transactions'],
  summary     : 'Create',
  operationId : 'createFinancialFundTransaction',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialFundTransactionSchema,
          example : {
            'transactionDate'        : '2026-01-01',
            'amountCredit'           : 100,
            'amountDebit'            : 0,
            'additionalDescription'  : '1/10 - Rent payment for January 2026',
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
            'financialBankAccountId' : 'cm1234567890abcdefghijkl'
          },
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
          example : {
            'id'                     : 'cm1234567890abcdefghijkl',
            'transactionDate'        : '2026-01-01',
            'amountCredit'           : 100,
            'amountDebit'            : 0,
            'additionalDescription'  : '1/10 - Rent payment for January 2026',
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
            'financialBankAccountId' : 'cm1234567890abcdefghijkl',
            'createdAt'              : '2026-01-01T00:00:00.000Z',
            'updatedAt'              : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialFundTransaction already exists',
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
          example : {
            'id'                     : 'cm1234567890abcdefghijkl',
            'transactionDate'        : '2026-01-01',
            'amountCredit'           : 100,
            'amountDebit'            : 0,
            'additionalDescription'  : '1/10 - Rent payment for January 2026',
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
            'financialBankAccountId' : 'cm1234567890abcdefghijkl',
            'createdAt'              : '2026-01-01T00:00:00.000Z',
            'updatedAt'              : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialFundTransaction not found',
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
          schema  : updateFinancialFundTransactionSchema,
          example : {
            'transactionDate'        : '2026-01-01',
            'amountCredit'           : 100,
            'amountDebit'            : 0,
            'additionalDescription'  : '1/10 - Rent payment for January 2026',
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
            'financialBankAccountId' : 'cm1234567890abcdefghijkl'
          },
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
          example : {
            'id'                     : 'cm1234567890abcdefghijkl',
            'transactionDate'        : '2026-01-01',
            'amountCredit'           : 100,
            'amountDebit'            : 0,
            'additionalDescription'  : '1/10 - Rent payment for January 2026',
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
            'financialBankAccountId' : 'cm1234567890abcdefghijkl',
            'createdAt'              : '2026-01-01T00:00:00.000Z',
            'updatedAt'              : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialFundTransaction not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialFundTransaction already exists',
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
      description : 'FinancialFundTransaction not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
