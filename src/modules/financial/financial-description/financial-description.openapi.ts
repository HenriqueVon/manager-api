import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialDescriptionSchema,
  updateFinancialDescriptionSchema,
  listFinancialDescriptionQuerySchema,
  financialDescriptionSchema,
  listFinancialDescriptionResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialDescription',
  financialDescriptionSchema
);

openApiRegistry.register(
  'CreateFinancialDescriptionInput',
  createFinancialDescriptionSchema
);

openApiRegistry.register(
  'UpdateFinancialDescriptionInput',
  updateFinancialDescriptionSchema
);

openApiRegistry.register(
  'ListFinancialDescriptionQuery',
  listFinancialDescriptionQuerySchema
);

openApiRegistry.register(
  'ListFinancialDescriptionResponse',
  listFinancialDescriptionResponseSchema
);

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/descriptions',
  tags        : ['Financial Descriptions'],
  summary     : 'List',
  operationId : 'listFinancialDescription',
  request     : {
    query: listFinancialDescriptionQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialDescription list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialDescriptionResponseSchema,
          example : {
            'items': [
              {
                'id'          : 'cm1234567890abcdefghijkl',
                'description' : 'SUPERMARKET',
                'createdAt'   : '2026-01-01T00:00:00.000Z',
                'updatedAt'   : '2026-01-01T00:00:00.000Z'
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
  path        : '/financial/descriptions',
  tags        : ['Financial Descriptions'],
  summary     : 'Create',
  operationId : 'createFinancialDescription',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialDescriptionSchema,
          example : {
            'description': 'SUPERMARKET'
          },
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialDescription created successfully',
      content     : {
        'application/json': {
          schema  : financialDescriptionSchema,
          example : {
            'id'          : 'cm1234567890abcdefghijkl',
            'description' : 'SUPERMARKET',
            'createdAt'   : '2026-01-01T00:00:00.000Z',
            'updatedAt'   : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialDescription already exists',
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
  path        : '/financial/descriptions/{id}',
  tags        : ['Financial Descriptions'],
  summary     : 'Get by id',
  operationId : 'getFinancialDescriptionById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialDescription returned successfully',
      content     : {
        'application/json': {
          schema  : financialDescriptionSchema,
          example : {
            'id'          : 'cm1234567890abcdefghijkl',
            'description' : 'SUPERMARKET',
            'createdAt'   : '2026-01-01T00:00:00.000Z',
            'updatedAt'   : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialDescription not found',
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
  path        : '/financial/descriptions/{id}',
  tags        : ['Financial Descriptions'],
  summary     : 'Update',
  operationId : 'updateFinancialDescription',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialDescriptionSchema,
          example : {
            'description': 'SUPERMARKET'
          },
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialDescription updated successfully',
      content     : {
        'application/json': {
          schema  : financialDescriptionSchema,
          example : {
            'id'          : 'cm1234567890abcdefghijkl',
            'description' : 'SUPERMARKET',
            'createdAt'   : '2026-01-01T00:00:00.000Z',
            'updatedAt'   : '2026-01-01T00:00:00.000Z'
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
      description : 'FinancialDescription not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialDescription already exists',
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
  path        : '/financial/descriptions/{id}',
  tags        : ['Financial Descriptions'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialDescription',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialDescription deleted successfully',
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
      description : 'FinancialDescription not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
