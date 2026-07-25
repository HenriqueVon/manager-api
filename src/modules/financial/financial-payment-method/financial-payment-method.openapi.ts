import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createFinancialPaymentMethodSchema,
  updateFinancialPaymentMethodSchema,
  listFinancialPaymentMethodQuerySchema,
  financialPaymentMethodSchema,
  listFinancialPaymentMethodResponseSchema,
} from './schemas';

openApiRegistry.register(
  'FinancialPaymentMethod',
  financialPaymentMethodSchema
);

openApiRegistry.register(
  'CreateFinancialPaymentMethodInput',
  createFinancialPaymentMethodSchema
);

openApiRegistry.register(
  'UpdateFinancialPaymentMethodInput',
  updateFinancialPaymentMethodSchema
);

openApiRegistry.register(
  'ListFinancialPaymentMethodQuery',
  listFinancialPaymentMethodQuerySchema
);

openApiRegistry.register(
  'ListFinancialPaymentMethodResponse',
  listFinancialPaymentMethodResponseSchema
);

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/payment-methods',
  tags        : ['Financial Payment Methods'],
  summary     : 'List',
  operationId : 'listFinancialPaymentMethod',
  request     : {
    query: listFinancialPaymentMethodQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialPaymentMethod list returned successfully',
      content     : {
        'application/json': {
          schema  : listFinancialPaymentMethodResponseSchema,
          example : {
            'items': [
              {
                'id'        : 'cm1234567890abcdefghijkl',
                'name'      : 'CREDIT CARD',
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
  path        : '/financial/payment-methods',
  tags        : ['Financial Payment Methods'],
  summary     : 'Create',
  operationId : 'createFinancialPaymentMethod',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialPaymentMethodSchema,
          example : {
            'name': 'CREDIT CARD'
          },
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialPaymentMethod created successfully',
      content     : {
        'application/json': {
          schema  : financialPaymentMethodSchema,
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'CREDIT CARD',
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
      description : 'FinancialPaymentMethod already exists',
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
  path        : '/financial/payment-methods/{id}',
  tags        : ['Financial Payment Methods'],
  summary     : 'Get by id',
  operationId : 'getFinancialPaymentMethodById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'FinancialPaymentMethod returned successfully',
      content     : {
        'application/json': {
          schema  : financialPaymentMethodSchema,
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'CREDIT CARD',
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
      description : 'FinancialPaymentMethod not found',
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
  path        : '/financial/payment-methods/{id}',
  tags        : ['Financial Payment Methods'],
  summary     : 'Update',
  operationId : 'updateFinancialPaymentMethod',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateFinancialPaymentMethodSchema,
          example : {
            'name': 'CREDIT CARD'
          },
        },
      },
    },
  },
  responses: {
    200: {
      description : 'FinancialPaymentMethod updated successfully',
      content     : {
        'application/json': {
          schema  : financialPaymentMethodSchema,
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'CREDIT CARD',
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
      description : 'FinancialPaymentMethod not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'FinancialPaymentMethod already exists',
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
  path        : '/financial/payment-methods/{id}',
  tags        : ['Financial Payment Methods'],
  summary     : 'Delete by id',
  operationId : 'deleteFinancialPaymentMethod',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'FinancialPaymentMethod deleted successfully',
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
      description : 'FinancialPaymentMethod not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
