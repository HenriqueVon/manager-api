import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialCategorySchema,
  updateFinancialCategorySchema,
  listFinancialCategoryQuerySchema,
  financialCategorySchema,
  listFinancialCategoryResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialCategory',
  financialCategorySchema
);

openApiRegistry.register(
  'CreateFinancialCategoryInput',
  createFinancialCategorySchema
);

openApiRegistry.register(
  'UpdateFinancialCategoryInput',
  updateFinancialCategorySchema
);

openApiRegistry.register(
  'ListFinancialCategoryQuery',
  listFinancialCategoryQuerySchema
);

openApiRegistry.register(
  'ListFinancialCategoryResponse',
  listFinancialCategoryResponseSchema
);

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/categories',
  tags        : ['Financial Categories'],
  summary     : 'List',
  operationId : 'listFinancialCategory',
  request     : {
    query: listFinancialCategoryQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialCategory list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialCategoryResponseSchema,
          example : {
            'items': [
              {
                'id'               : 'cm1234567890abcdefghijkl',
                'name'             : 'SUPERMARKET',
                'type'             : 'EXPENSE',
                'balance'          : 0,
                'ledgerId'         : 'cm1234567890abcdefghijkl',
                'parentCategoryId' : 'cm1234567890abcdefghijkl',
                'createdAt'        : '2026-01-01T00:00:00.000Z',
                'updatedAt'        : '2026-01-01T00:00:00.000Z'
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
  path        : '/financial/categories',
  tags        : ['Financial Categories'],
  summary     : 'Create',
  operationId : 'createFinancialCategory',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialCategorySchema,
          example : {
            'name'             : 'SUPERMARKET',
            'type'             : 'EXPENSE',
            'balance'          : 0,
            'ledgerId'         : 'cm1234567890abcdefghijkl',
            'parentCategoryId' : 'cm1234567890abcdefghijkl'
          },
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialCategory created successfully',
      content     : {
        'application/json': {
          schema  : financialCategorySchema,
          example : {
            'id'               : 'cm1234567890abcdefghijkl',
            'name'             : 'SUPERMARKET',
            'type'             : 'EXPENSE',
            'balance'          : 0,
            'ledgerId'         : 'cm1234567890abcdefghijkl',
            'parentCategoryId' : 'cm1234567890abcdefghijkl',
            'createdAt'        : '2026-01-01T00:00:00.000Z',
            'updatedAt'        : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialCategory already exists',
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
  path        : '/financial/categories/{id}',
  tags        : ['Financial Categories'],
  summary     : 'Get by id',
  operationId : 'getFinancialCategoryById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialCategory returned successfully',
      content     : {
        'application/json': {
          schema  : financialCategorySchema,
          example : {
            'id'               : 'cm1234567890abcdefghijkl',
            'name'             : 'SUPERMARKET',
            'type'             : 'EXPENSE',
            'balance'          : 0,
            'ledgerId'         : 'cm1234567890abcdefghijkl',
            'parentCategoryId' : 'cm1234567890abcdefghijkl',
            'createdAt'        : '2026-01-01T00:00:00.000Z',
            'updatedAt'        : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialCategory not found',
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
  path        : '/financial/categories/{id}',
  tags        : ['Financial Categories'],
  summary     : 'Update',
  operationId : 'updateFinancialCategory',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialCategorySchema,
          example : {
            'name'             : 'SUPERMARKET',
            'type'             : 'EXPENSE',
            'balance'          : 0,
            'ledgerId'         : 'cm1234567890abcdefghijkl',
            'parentCategoryId' : 'cm1234567890abcdefghijkl'
          },
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialCategory updated successfully',
      content     : {
        'application/json': {
          schema  : financialCategorySchema,
          example : {
            'id'               : 'cm1234567890abcdefghijkl',
            'name'             : 'SUPERMARKET',
            'type'             : 'EXPENSE',
            'balance'          : 0,
            'ledgerId'         : 'cm1234567890abcdefghijkl',
            'parentCategoryId' : 'cm1234567890abcdefghijkl',
            'createdAt'        : '2026-01-01T00:00:00.000Z',
            'updatedAt'        : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialCategory not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialCategory already exists',
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
  path        : '/financial/categories/{id}',
  tags        : ['Financial Categories'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialCategory',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialCategory deleted successfully',
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
      description : 'FinancialCategory not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
