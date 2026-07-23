import './modules';
import { openApiTags } from './tags';
import { env } from '@config/env';

import {
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';

import { apiKeyAuth, openApiRegistry } from './registry';

export function createOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(
    openApiRegistry.definitions
  );

  return generator.generateDocument({
    openapi: '3.0.0',

    info: {
      title       : 'Manager API',
      version     : '1.0.0',
      description : 'Manager API documentation',
    },

    tags: openApiTags,
    
    servers: [
      {
        url         : `http://localhost:${env.app.port}/v1/api`,
        description : 'Local Development',
      },
    ],

    security: [
      {
        [apiKeyAuth.name]: [],
      },
    ],
  });
}