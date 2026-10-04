import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialCategorySchema,
  updateFinancialCategorySchema,
  listFinancialCategoryQuerySchema,
  financialCategorySchema,
  listFinancialCategoryResponseSchema,
} from './schemas';

const createFinancialCategoryInput = openApiRegistry.register(
  'CreateFinancialCategoryInput',
  createFinancialCategorySchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialCategoryInput = openApiRegistry.register(
  'UpdateFinancialCategoryInput',
  updateFinancialCategorySchema.openapi({ minProperties: 1 })
);

const financialCategoryInputExample = {
  name             : 'SUPERMARKET',
  type             : 'EXPENSE',
  balance          : 0,
  ledgerId         : 'cm1234567890abcdefghijkl',
  parentCategoryId : 'cm1234567890abcdefghijkl',
};

const financialCategoryExample = {
  id               : 'cm1234567890abcdefghijkl',
  ledgerId         : 'cm1234567890abcdefghijkl',
  parentCategoryId : 'cm1234567890abcdefghijkl',
  name             : 'SUPERMARKET',
  type             : 'EXPENSE',
  balance          : '0',
  createdAt        : '2026-01-01T00:00:00.000Z',
  updatedAt        : '2026-01-01T00:00:00.000Z',
};

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
          example : { items: [financialCategoryExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
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
          schema  : createFinancialCategoryInput,
          example : financialCategoryInputExample,
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
          example : financialCategoryExample,
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
          example : financialCategoryExample,
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
          schema  : updateFinancialCategoryInput,
          example : financialCategoryInputExample,
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
          example : financialCategoryExample,
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
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});
