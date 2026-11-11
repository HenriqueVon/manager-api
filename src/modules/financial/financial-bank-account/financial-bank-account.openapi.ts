import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createFinancialBankAccountSchema,
  updateFinancialBankAccountSchema,
  listFinancialBankAccountQuerySchema,
  financialBankAccountSchema,
  listFinancialBankAccountResponseSchema,
} from './schemas';

const createFinancialBankAccountInput = openApiRegistry.register(
  'CreateFinancialBankAccountInput',
  createFinancialBankAccountSchema
);

// minProperties documents the "at least one field" refine rule
const updateFinancialBankAccountInput = openApiRegistry.register(
  'UpdateFinancialBankAccountInput',
  updateFinancialBankAccountSchema.openapi({ minProperties: 1 })
);

const financialBankAccountInputExample = {
  name                : 'REVOLUT',
  type                : 'PERSONAL',
  balance             : 1000,
  ledgerId            : 'cm1234567890abcdefghijkl',
  financialCurrencyId : 'cm1234567890abcdefghijkl',
};

const financialBankAccountExample = {
  id                  : 'cm1234567890abcdefghijkl',
  name                : 'REVOLUT',
  type                : 'PERSONAL',
  balance             : '1000',
  financialCurrencyId : 'cm1234567890abcdefghijkl',
  ledgerId            : 'cm1234567890abcdefghijkl',
  createdAt           : '2026-01-01T00:00:00.000Z',
  updatedAt           : '2026-01-01T00:00:00.000Z',
};

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
          example : { items: [financialBankAccountExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
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
          schema  : createFinancialBankAccountInput,
          example : financialBankAccountInputExample,
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
          example : financialBankAccountExample,
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
          example : financialBankAccountExample,
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
          schema  : updateFinancialBankAccountInput,
          example : financialBankAccountInputExample,
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
          example : financialBankAccountExample,
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
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});
