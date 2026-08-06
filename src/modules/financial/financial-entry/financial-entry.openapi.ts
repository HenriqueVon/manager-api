import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialEntrySchema,
  updateFinancialEntrySchema,
  listFinancialEntryQuerySchema,
  financialEntrySchema,
  listFinancialEntryResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialEntry',
  financialEntrySchema
);

openApiRegistry.register(
  'CreateFinancialEntryInput',
  createFinancialEntrySchema
);

openApiRegistry.register(
  'UpdateFinancialEntryInput',
  updateFinancialEntrySchema
);

openApiRegistry.register(
  'ListFinancialEntryQuery',
  listFinancialEntryQuerySchema
);

openApiRegistry.register(
  'ListFinancialEntryResponse',
  listFinancialEntryResponseSchema
);

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/entries',
  tags        : ['Financial Entries'],
  summary     : 'List',
  operationId : 'listFinancialEntry',
  request     : {
    query: listFinancialEntryQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialEntry list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialEntryResponseSchema,
          example : {
            'items': [
              {
                'id'                     : 'cm1234567890abcdefghijkl',
                'type'                   : 'PAYABLE',
                'dueDate'                : '2024-01-01',
                'paymentDate'            : '2024-01-01',
                'amount'                 : 100,
                'amountPaid'             : 0,
                'additionalDescription'  : '1/2 playstation 5',
                'isMonthly'              : false,
                'ledgerId'               : 'cm1234567890abcdefghijkl',
                'financialDescriptionId' : 'cm1234567890abcdefghijkl',
                'financialFundId'        : 'cm1234567890abcdefghijkl',
                'financialCategoryId'    : 'cm1234567890abcdefghijkl',
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
  path        : '/financial/entries',
  tags        : ['Financial Entries'],
  summary     : 'Create',
  operationId : 'createFinancialEntry',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialEntrySchema,
          example : {
            'type'                   : 'PAYABLE',
            'dueDate'                : '2024-01-01',
            'paymentDate'            : '2024-01-01',
            'amount'                 : 100,
            'amountPaid'             : 0,
            'additionalDescription'  : '1/2 playstation 5',
            'isMonthly'              : false,
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl'
          },
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialEntry created successfully',
      content     : {
        'application/json': {
          schema  : financialEntrySchema,
          example : {
            'id'                     : 'cm1234567890abcdefghijkl',
            'type'                   : 'PAYABLE',
            'dueDate'                : '2024-01-01',
            'paymentDate'            : '2024-01-01',
            'amount'                 : 100,
            'amountPaid'             : 0,
            'additionalDescription'  : '1/2 playstation 5',
            'isMonthly'              : false,
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
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
      description : 'FinancialEntry already exists',
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
  path        : '/financial/entries/{id}',
  tags        : ['Financial Entries'],
  summary     : 'Get by id',
  operationId : 'getFinancialEntryById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialEntry returned successfully',
      content     : {
        'application/json': {
          schema  : financialEntrySchema,
          example : {
            'id'                     : 'cm1234567890abcdefghijkl',
            'type'                   : 'PAYABLE',
            'dueDate'                : '2024-01-01',
            'paymentDate'            : '2024-01-01',
            'amount'                 : 100,
            'amountPaid'             : 0,
            'additionalDescription'  : '1/2 playstation 5',
            'isMonthly'              : false,
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
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
      description : 'FinancialEntry not found',
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
  path        : '/financial/entries/{id}',
  tags        : ['Financial Entries'],
  summary     : 'Update',
  operationId : 'updateFinancialEntry',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialEntrySchema,
          example : {
            'type'                   : 'PAYABLE',
            'dueDate'                : '2024-01-01',
            'paymentDate'            : '2024-01-01',
            'amount'                 : 100,
            'amountPaid'             : 0,
            'additionalDescription'  : '1/2 playstation 5',
            'isMonthly'              : false,
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl'
          },
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialEntry updated successfully',
      content     : {
        'application/json': {
          schema  : financialEntrySchema,
          example : {
            'id'                     : 'cm1234567890abcdefghijkl',
            'type'                   : 'PAYABLE',
            'dueDate'                : '2024-01-01',
            'paymentDate'            : '2024-01-01',
            'amount'                 : 100,
            'amountPaid'             : 0,
            'additionalDescription'  : '1/2 playstation 5',
            'isMonthly'              : false,
            'ledgerId'               : 'cm1234567890abcdefghijkl',
            'financialDescriptionId' : 'cm1234567890abcdefghijkl',
            'financialFundId'        : 'cm1234567890abcdefghijkl',
            'financialCategoryId'    : 'cm1234567890abcdefghijkl',
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
      description : 'FinancialEntry not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialEntry already exists',
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
  path        : '/financial/entries/{id}',
  tags        : ['Financial Entries'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialEntry',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialEntry deleted successfully',
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
      description : 'FinancialEntry not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
