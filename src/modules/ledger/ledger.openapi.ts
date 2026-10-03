import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import {
  createLedgerSchema,
  updateLedgerSchema,
  listLedgerQuerySchema,
  ledgerSchema,
  listLedgerResponseSchema,
} from './schemas';

const createLedgerInput = openApiRegistry.register(
  'CreateLedgerInput',
  createLedgerSchema
);

// minProperties documents the "at least one field" refine rule
const updateLedgerInput = openApiRegistry.register(
  'UpdateLedgerInput',
  updateLedgerSchema.openapi({ minProperties: 1 })
);

const ledgerInputExample = {
  name : 'EUROPE',
  type : 'FIAT',
};

const ledgerExample = {
  id        : 'cm1234567890abcdefghijkl',
  name      : 'EUROPE',
  type      : 'FIAT',
  createdAt : '2026-01-01T00:00:00.000Z',
  updatedAt : '2026-01-01T00:00:00.000Z',
};

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/ledgers',
  tags        : ['Ledgers'],
  summary     : 'List',
  operationId : 'listLedger',
  request     : {
    query: listLedgerQuerySchema,
  },
  responses: {
    200: {
      description : 'Ledger list returned successfully',
      content     : {
        'application/json': {
          schema  : listLedgerResponseSchema,
          example : { items: [ledgerExample], total: 1 },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/ledgers',
  tags        : ['Ledgers'],
  summary     : 'Create',
  operationId : 'createLedger',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createLedgerInput,
          example : ledgerInputExample,
        },
      },
    },
  },
  responses: {
    201: {
      description : 'Ledger created successfully',
      content     : {
        'application/json': {
          schema  : ledgerSchema,
          example : ledgerExample,
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
  path        : '/ledgers/{id}',
  tags        : ['Ledgers'],
  summary     : 'Get by id',
  operationId : 'getLedgerById',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    200: {
      description : 'Ledger returned successfully',
      content     : {
        'application/json': {
          schema  : ledgerSchema,
          example : ledgerExample,
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
  path        : '/ledgers/{id}',
  tags        : ['Ledgers'],
  summary     : 'Update',
  operationId : 'updateLedger',
  request     : {
    params : idParamsSchema,
    body   : {
      required : true,
      content  : {
        'application/json': {
          schema  : updateLedgerInput,
          example : ledgerInputExample,
        },
      },
    },
  },
  responses: {
    200: {
      description : 'Ledger updated successfully',
      content     : {
        'application/json': {
          schema  : ledgerSchema,
          example : ledgerExample,
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
  path        : '/ledgers/{id}',
  tags        : ['Ledgers'],
  summary     : 'Delete by id',
  operationId : 'deleteLedger',
  request     : {
    params: idParamsSchema,
  },
  responses: {
    204: {
      description: 'Ledger deleted successfully',
    },
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});
