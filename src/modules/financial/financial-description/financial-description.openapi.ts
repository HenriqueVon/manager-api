import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialDescriptionSchema,
  updateFinancialDescriptionSchema,
  listFinancialDescriptionQuerySchema,
  financialDescriptionSchema,
  listFinancialDescriptionResponseSchema,
} from './schemas';

const createFinancialDescriptionInput = openApiRegistry.register(
  'CreateFinancialDescriptionInput',
  createFinancialDescriptionSchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialDescriptionInput = openApiRegistry.register(
  'UpdateFinancialDescriptionInput',
  updateFinancialDescriptionSchema.openapi({ minProperties: 1 })
);

const financialDescriptionInputExample = {
  description: 'SUPERMARKET',
};

const financialDescriptionExample = {
  id          : 'cm1234567890abcdefghijkl',
  description : 'SUPERMARKET',
  createdAt   : '2026-01-01T00:00:00.000Z',
  updatedAt   : '2026-01-01T00:00:00.000Z',
};

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
          example : { items: [financialDescriptionExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
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
          schema  : createFinancialDescriptionInput,
          example : financialDescriptionInputExample,
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
          example : financialDescriptionExample,
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
          example : financialDescriptionExample,
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
          schema  : updateFinancialDescriptionInput,
          example : financialDescriptionInputExample,
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
          example : financialDescriptionExample,
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
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});
