import { openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { idParamsSchema } from '@shared/schemas/id.schema';
import { bulkDeleteSchema } from '@shared/schemas/bulk-delete.schema';
import {
  createFinancialEntrySchema,
  createFinancialEntryInstallmentsSchema,
  createFinancialEntryMonthlySchema,
  updateFinancialEntrySchema,
  listFinancialEntryQuerySchema,
  financialEntrySchema,
  financialEntryInstallmentsResponseSchema,
  financialEntryMonthlyResponseSchema,
  listFinancialEntryResponseSchema,
  summaryFinancialEntryQuerySchema,
  summaryFinancialEntryResponseSchema,
  summaryBreakdownFinancialEntryQuerySchema,
  agingFinancialEntryQuerySchema,
  summaryByMonthFinancialEntryResponseSchema,
  summaryByCategoryFinancialEntryResponseSchema,
  agingFinancialEntryResponseSchema,
} from './schemas';

const createFinancialEntryInput = openApiRegistry.register(
  'CreateFinancialEntryInput',
  createFinancialEntrySchema
);

const createFinancialEntryInstallmentsInput = openApiRegistry.register(
  'CreateFinancialEntryInstallmentsInput',
  createFinancialEntryInstallmentsSchema
);

const createFinancialEntryMonthlyInput = openApiRegistry.register(
  'CreateFinancialEntryMonthlyInput',
  createFinancialEntryMonthlySchema
);

const bulkDeleteFinancialEntryInput = openApiRegistry.register(
  'BulkDeleteFinancialEntryInput',
  bulkDeleteSchema
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

const financialEntryInstallmentsInputExample = {
  type                   : 'PAYABLE',
  dueDate                : '2026-11-05',
  amount                 : 3000,
  installments           : 3,
  additionalDescription  : 'Flight ticket',
  ledgerId               : 'cm1234567890abcdefghijkl',
  financialDescriptionId : 'cm1234567890abcdefghijkl',
  financialFundId        : 'cm1234567890abcdefghijkl',
  financialCategoryId    : 'cm1234567890abcdefghijkl',
};

const financialEntryInstallmentsExample = [
  { dueDate: '2026-11-05T00:00:00.000Z', number: 1 },
  { dueDate: '2026-12-05T00:00:00.000Z', number: 2 },
  { dueDate: '2027-01-05T00:00:00.000Z', number: 3 },
].map(({ dueDate, number }) => ({
  ...financialEntryExample,
  dueDate,
  paymentDate           : null,
  amount                : '1000',
  additionalDescription : `Flight ticket ${number}/3`,
}));

const financialEntryMonthlyInputExample = {
  type                   : 'PAYABLE',
  dueDate                : '2026-11-05',
  amount                 : 120,
  repeatCount            : 3,
  additionalDescription  : 'Internet',
  ledgerId               : 'cm1234567890abcdefghijkl',
  financialDescriptionId : 'cm1234567890abcdefghijkl',
  financialFundId        : 'cm1234567890abcdefghijkl',
  financialCategoryId    : 'cm1234567890abcdefghijkl',
};

const financialEntryMonthlyExample = [
  '2026-11-05T00:00:00.000Z',
  '2026-12-05T00:00:00.000Z',
  '2027-01-05T00:00:00.000Z',
].map((dueDate) => ({
  ...financialEntryExample,
  dueDate,
  paymentDate           : null,
  amount                : '120',
  additionalDescription : 'Internet',
  isMonthly             : true,
}));

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
  method      : 'post',
  path        : '/financial/entries/installments',
  tags        : ['Financial Entries'],
  summary     : 'Create in installments',
  description : 'Splits the amount in monthly entries, saved together: all of them or none. The last installment takes the cents left over. Each additionalDescription ends with its number, such as "Flight ticket 1/3".',
  operationId : 'createFinancialEntryInstallments',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialEntryInstallmentsInput,
          example : financialEntryInstallmentsInputExample,
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialEntry installments created successfully',
      content     : {
        'application/json': {
          schema  : financialEntryInstallmentsResponseSchema,
          example : financialEntryInstallmentsExample,
        },
      },
    },
    400 : responseRef('ValidationError'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/financial/entries/monthly',
  tags        : ['Financial Entries'],
  summary     : 'Create repeating every month',
  description : 'Repeats the same entry every month, saved together: all of them or none. repeatCount is the total of entries, the first one included, from 2 to 60. Each one keeps the full amount and the same additionalDescription, is created unpaid and has isMonthly true.',
  operationId : 'createFinancialEntryMonthly',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : createFinancialEntryMonthlyInput,
          example : financialEntryMonthlyInputExample,
        },
      },
    },
  },
  responses: {
    201: {
      description : 'FinancialEntry monthly entries created successfully',
      content     : {
        'application/json': {
          schema  : financialEntryMonthlyResponseSchema,
          example : financialEntryMonthlyExample,
        },
      },
    },
    400 : responseRef('ValidationError'),
    409 : responseRef('Conflict'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/financial/entries/bulk-delete',
  tags        : ['Financial Entries'],
  summary     : 'Delete several',
  description : 'Deletes up to 100 entries in one call, all or none. When some id does not exist, nothing is deleted and the 404 lists the ids that are missing in ids.',
  operationId : 'bulkDeleteFinancialEntry',
  request     : {
    body: {
      required : true,
      content  : {
        'application/json': {
          schema  : bulkDeleteFinancialEntryInput,
          example : { ids: ['cm1234567890abcdefghijkl', 'cm1234567890abcdefghijkm'] },
        },
      },
    },
  },
  responses: {
    204 : { description: 'FinancialEntry records deleted successfully' },
    400 : responseRef('ValidationError'),
    404 : responseRef('NotFound'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/entries/summary',
  tags        : ['Financial Entries'],
  summary     : 'Summary',
  description : 'Sums the amount and the amount paid of the entries that match the filters, with one group per type and currency (the currency of the fund of the entry). With ids, sums only those entries. With paid, sums only the entries with (true) or without (false) a payment date. A filter that matches nothing returns no groups.',
  operationId : 'summaryFinancialEntry',
  request     : {
    query: summaryFinancialEntryQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialEntry summary returned successfully',
      content     : {
        'application/json': {
          schema  : summaryFinancialEntryResponseSchema,
          example : { items: [{ type: 'PAYABLE', financialCurrencyId: 'cm1234567890abcdefghijkl', count: 3, amount: '3000', amountPaid: '1000' }] },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/entries/summary/by-month',
  tags        : ['Financial Entries'],
  summary     : 'Summary by month',
  description : 'The same sums as the summary, with one group per month of the due date (YYYY-MM), type and currency. Months without entries are not returned. Takes the same filters as the summary, except ids.',
  operationId : 'summaryByMonthFinancialEntry',
  request     : {
    query: summaryBreakdownFinancialEntryQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialEntry summary by month returned successfully',
      content     : {
        'application/json': {
          schema  : summaryByMonthFinancialEntryResponseSchema,
          example : { items: [{ month: '2026-11', type: 'PAYABLE', financialCurrencyId: 'cm1234567890abcdefghijkl', count: 3, amount: '3000', amountPaid: '1000' }] },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/entries/summary/by-category',
  tags        : ['Financial Entries'],
  summary     : 'Summary by category',
  description : 'The same sums as the summary, with one group per category, type and currency. The category is the one of the entry, not a parent of it. Takes the same filters as the summary, except ids.',
  operationId : 'summaryByCategoryFinancialEntry',
  request     : {
    query: summaryBreakdownFinancialEntryQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialEntry summary by category returned successfully',
      content     : {
        'application/json': {
          schema  : summaryByCategoryFinancialEntryResponseSchema,
          example : { items: [{ financialCategoryId: 'cm1234567890abcdefghijkl', type: 'PAYABLE', financialCurrencyId: 'cm1234567890abcdefghijkl', count: 3, amount: '3000', amountPaid: '1000' }] },
        },
      },
    },
    400: responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'get',
  path        : '/financial/entries/summary/aging',
  tags        : ['Financial Entries'],
  summary     : 'Aging',
  description : 'What is still to pay or receive (amount minus amount paid) in the entries without a payment date, grouped by how far the due date is from today (the current UTC date), type and currency. Bands without entries are not returned.',
  operationId : 'agingFinancialEntry',
  request     : {
    query: agingFinancialEntryQuerySchema,
  },
  responses: {
    200: {
      description : 'FinancialEntry aging returned successfully',
      content     : {
        'application/json': {
          schema  : agingFinancialEntryResponseSchema,
          example : { items: [{ band: 'OVERDUE', type: 'PAYABLE', financialCurrencyId: 'cm1234567890abcdefghijkl', count: 2, amountOpen: '500' }] },
        },
      },
    },
    400: responseRef('ValidationError'),
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
