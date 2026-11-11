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
  | 'PayloadTooLarge'
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
  'Request validation failed (ValidationErrorResponse) or the JSON body is malformed (AppErrorResponse with code BAD_REQUEST)',
  { oneOf: [schemaRef('ValidationErrorResponse'), schemaRef('AppErrorResponse')] }
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
  'A resource with the same unique values already exists, or the operation conflicts with related records.',
  schemaRef('AppErrorResponse')
);

registerJsonResponse(
  'PayloadTooLarge',
  'The JSON body is larger than the limit of the body parser',
  schemaRef('AppErrorResponse')
);

registerJsonResponse(
  'InternalError',
  'Unexpected error',
  schemaRef('InternalErrorResponse')
);

export const responseRef = (name: ResponseName) => ({ $ref: `#/components/responses/${name}` });

// Responses that every endpoint can return, produced by the global middlewares
export const globalErrorResponses = {
  401 : responseRef('Unauthorized'),
  403 : responseRef('Forbidden'),
  413 : responseRef('PayloadTooLarge'),
  500 : responseRef('InternalError'),
};
