import { openApiRegistry } from '@docs/openapi/registry';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { errorResponseSchema } from '@shared/schemas/error-response.schema';
import {
  createLedgerSchema,
  updateLedgerSchema,
  listLedgerQuerySchema,
  ledgerSchema,
  listLedgerResponseSchema,
} from './schemas';

openApiRegistry.register(
  'Ledger',
  ledgerSchema
);

openApiRegistry.register(
  'CreateLedgerInput',
  createLedgerSchema
);

openApiRegistry.register(
  'UpdateLedgerInput',
  updateLedgerSchema
);

openApiRegistry.register(
  'ListLedgerQuery',
  listLedgerQuerySchema
);

openApiRegistry.register(
  'ListLedgerResponse',
  listLedgerResponseSchema
);

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
          example : {
            'items': [
              {
                'id'        : 'cm1234567890abcdefghijkl',
                'name'      : 'EUROPE',
                'type'      : 'FIAT',
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
  path        : '/ledgers',
  tags        : ['Ledgers'],
  summary     : 'Create',
  operationId : 'createLedger',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createLedgerSchema,
          example : {
            'name' : 'EUROPE',
            'type' : 'FIAT'
          },
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
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'EUROPE',
            'type'      : 'FIAT',
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
      description : 'Ledger already exists',
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
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'EUROPE',
            'type'      : 'FIAT',
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
      description : 'Ledger not found',
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
          schema  : updateLedgerSchema,
          example : {
            'name' : 'EUROPE',
            'type' : 'FIAT'
          },
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
          example : {
            'id'        : 'cm1234567890abcdefghijkl',
            'name'      : 'EUROPE',
            'type'      : 'FIAT',
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
      description : 'Ledger not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    409: {
      description : 'Ledger already exists',
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
      description : 'Ledger not found',
      content     : {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});
