import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialPaymentMethodSchema,
  updateFinancialPaymentMethodSchema,
  listFinancialPaymentMethodQuerySchema,
  financialPaymentMethodSchema,
  listFinancialPaymentMethodResponseSchema,
} from './schemas';

const createFinancialPaymentMethodInput = openApiRegistry.register(
  'CreateFinancialPaymentMethodInput',
  createFinancialPaymentMethodSchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialPaymentMethodInput = openApiRegistry.register(
  'UpdateFinancialPaymentMethodInput',
  updateFinancialPaymentMethodSchema.openapi({ minProperties: 1 })
);

const financialPaymentMethodInputExample = {
  name: 'CREDIT CARD',
};

const financialPaymentMethodExample = {
  id        : 'cm1234567890abcdefghijkl',
  name      : 'CREDIT CARD',
  createdAt : '2026-01-01T00:00:00.000Z',
  updatedAt : '2026-01-01T00:00:00.000Z',
};

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
          example : { items: [financialPaymentMethodExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
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
          schema  : createFinancialPaymentMethodInput,
          example : financialPaymentMethodInputExample,
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
          example : financialPaymentMethodExample,
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
          example : financialPaymentMethodExample,
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
          schema  : updateFinancialPaymentMethodInput,
          example : financialPaymentMethodInputExample,
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
          example : financialPaymentMethodExample,
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
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});
