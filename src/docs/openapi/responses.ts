import { openApiRegistry } from './registry';
import {
  appErrorResponseSchema,
  validationErrorResponseSchema,
  internalErrorResponseSchema,
} from '@shared/schemas/error-response.schema';

type ResponseName =
  | 'ValidationError'
  | 'ValidationOrBusinessRuleError'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'Conflict'
  | 'InternalError';

openApiRegistry.register('AppErrorResponse', appErrorResponseSchema);
openApiRegistry.register('ValidationErrorResponse', validationErrorResponseSchema);
openApiRegistry.register('InternalErrorResponse', internalErrorResponseSchema);

type SchemaReference = { $ref: string };

const schemaRef = (name: string): SchemaReference => ({ $ref: `#/components/schemas/${name}` });

function registerJsonResponse(
  name: ResponseName,
  description: string,
  schema: SchemaReference | { oneOf: SchemaReference[] }
) {
  openApiRegistry.registerComponent('responses', name, {
    description,
    content: {
      'application/json': { schema },
    },
  });
}

registerJsonResponse(
  'ValidationError',
  'Request params, query or body failed validation',
  schemaRef('ValidationErrorResponse')
);

registerJsonResponse(
  'ValidationOrBusinessRuleError',
  'Request validation failed (ValidationErrorResponse) or a business rule was violated (AppErrorResponse with code BAD_REQUEST)',
  { oneOf: [schemaRef('ValidationErrorResponse'), schemaRef('AppErrorResponse')] }
);

registerJsonResponse(
  'Unauthorized',
  'Missing x-api-key header, missing or invalid Authorization header, or bearer token rejected by the authentication API',
  schemaRef('AppErrorResponse')
);

registerJsonResponse(
  'Forbidden',
  'Invalid x-api-key',
  schemaRef('AppErrorResponse')
);

registerJsonResponse(
  'NotFound',
  'Resource not found',
  schemaRef('AppErrorResponse')
);

registerJsonResponse(
  'Conflict',
  'A resource with the same unique values already exists',
  schemaRef('AppErrorResponse')
);

registerJsonResponse(
  'InternalError',
  'Unexpected error. Currently also returned for foreign-key violations (a related id that does not exist, or deleting a record that is still referenced) and for malformed JSON bodies',
  schemaRef('InternalErrorResponse')
);

export const responseRef = (name: ResponseName) => ({ $ref: `#/components/responses/${name}` });

// Responses that every endpoint can return, produced by the global middlewares
export const globalErrorResponses = {
  401 : responseRef('Unauthorized'),
  403 : responseRef('Forbidden'),
  500 : responseRef('InternalError'),
};
