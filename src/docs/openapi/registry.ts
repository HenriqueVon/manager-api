import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const openApiRegistry = new OpenAPIRegistry();

export const apiKeyAuth = openApiRegistry.registerComponent(
  'securitySchemes',
  'ApiKeyAuth',
  {
    type : 'apiKey',
    in   : 'header',
    name : 'x-api-key',
  }
);