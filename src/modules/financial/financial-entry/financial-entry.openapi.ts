import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialEntrySchema,
  updateFinancialEntrySchema,
  listFinancialEntryQuerySchema,
  financialEntrySchema,
  listFinancialEntryResponseSchema,
} from './schemas';

const createFinancialEntryInput = openApiRegistry.register(
  'CreateFinancialEntryInput',
  createFinancialEntrySchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialEntryInput = openApiRegistry.register(
  'UpdateFinancialEntryInput',
  updateFinancialEntrySchema.openapi({ minProperties: 1 })
);

const financialEntryInputExample = {
  type                   : 'PAYABLE',
  dueDate                : '2024-01-01',
  paymentDate            : '2024-01-01',
  amount                 : 100,
  amountPaid             : 0,
  additionalDescription  : '1/2 playstation 5',
  isMonthly              : false,
  ledgerId               : 'cm1234567890abcdefghijkl',
  financialDescriptionId : 'cm1234567890abcdefghijkl',
  financialFundId        : 'cm1234567890abcdefghijkl',
  financialCategoryId    : 'cm1234567890abcdefghijkl',
};

const financialEntryExample = {
  id                     : 'cm1234567890abcdefghijkl',
  type                   : 'PAYABLE',
  dueDate                : '2024-01-01T00:00:00.000Z',
  paymentDate            : '2024-01-01T00:00:00.000Z',
  amount                 : '100',
  amountPaid             : '0',
  additionalDescription  : '1/2 playstation 5',
  isMonthly              : false,
  ledgerId               : 'cm1234567890abcdefghijkl',
  financialDescriptionId : 'cm1234567890abcdefghijkl',
  financialFundId        : 'cm1234567890abcdefghijkl',
  financialCategoryId    : 'cm1234567890abcdefghijkl',
  createdAt              : '2026-01-01T00:00:00.000Z',
  updatedAt              : '2026-01-01T00:00:00.000Z',
};

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
          example : { items: [financialEntryExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
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
          schema  : createFinancialEntryInput,
          example : financialEntryInputExample,
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
          example : financialEntryExample,
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
          example : financialEntryExample,
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
          schema  : updateFinancialEntryInput,
          example : financialEntryInputExample,
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
          example : financialEntryExample,
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
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});
