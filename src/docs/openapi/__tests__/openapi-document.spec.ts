import './test-env';
import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import routes from '../../../routes';
import { createOpenApiDocument } from '../document';
import { openApiTags } from '../tags';
import {
  listExpressRoutes,
  listDocumentedOperations,
  forEachOperation,
} from './helpers';

const document = createOpenApiDocument() as any;

const SUCCESS_STATUS_BY_METHOD: Record<string, string> = {
  get    : '200',
  post   : '201',
  patch  : '200',
  delete : '204',
};

describe('OpenAPI document', () => {
  describe('routes', () => {
    it('should document every Express route, and only those routes', () => {
      expect(listDocumentedOperations(document)).toEqual(listExpressRoutes(routes));
    });

    it('should document the success status used by the controllers for each method', () => {
      forEachOperation(document, (name, operation, _path, method) => {
        const successStatuses = Object.keys(operation.responses).filter((status) => status.startsWith('2'));

        expect(successStatuses, name).toEqual([SUCCESS_STATUS_BY_METHOD[method]]);
      });
    });
  });

  describe('security', () => {
    it('should require the API key AND the bearer token in a single requirement', () => {
      expect(document.security).toEqual([{ ApiKeyAuth: [], BearerAuth: [] }]);
    });

    it('should define the security schemes used by the global middlewares', () => {
      expect(document.components.securitySchemes).toEqual({
        ApiKeyAuth : { type: 'apiKey', in: 'header', name: 'x-api-key' },
        BearerAuth : { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      });
    });
  });

  describe('error responses', () => {
    it('should document the global 401, 403 and 500 responses on every operation', () => {
      forEachOperation(document, (name, operation) => {
        expect(operation.responses['401'], name).toEqual({ $ref: '#/components/responses/Unauthorized' });
        expect(operation.responses['403'], name).toEqual({ $ref: '#/components/responses/Forbidden' });
        expect(operation.responses['500'], name).toEqual({ $ref: '#/components/responses/InternalError' });
      });
    });

    it('should document 400 on every operation and 404 on every operation with an id', () => {
      forEachOperation(document, (name, operation, path) => {
        expect(operation.responses['400'], name).toBeDefined();

        if (path.includes('{id}')) {
          expect(operation.responses['404'], name).toEqual({ $ref: '#/components/responses/NotFound' });
        } else {
          expect(operation.responses['404'], name).toBeUndefined();
        }
      });
    });

    it('should reference shared response components for every error response', () => {
      forEachOperation(document, (name, operation) => {
        for (const [status, response] of Object.entries<any>(operation.responses)) {
          if (status.startsWith('2')) continue;

          expect(response.$ref, `${name} ${status}`).toMatch(/^#\/components\/responses\//);
        }
      });
    });
  });

  describe('integrity', () => {
    it('should resolve every $ref and leave no component unused', () => {
      const serialized = JSON.stringify(document);
      const references = new Set(
        [...serialized.matchAll(/"#\/components\/(schemas|responses)\/([A-Za-z]+)"/g)].map((m) => `${m[1]}/${m[2]}`)
      );

      const components = [
        ...Object.keys(document.components.schemas).map((name) => `schemas/${name}`),
        ...Object.keys(document.components.responses).map((name) => `responses/${name}`),
      ];

      expect([...references].filter((ref) => !components.includes(ref))).toEqual([]);
      expect(components.filter((component) => !references.has(component))).toEqual([]);
    });

    it('should have unique operationIds', () => {
      const operationIds: string[] = [];
      forEachOperation(document, (_name, operation) => operationIds.push(operation.operationId));

      expect(new Set(operationIds).size).toBe(operationIds.length);
    });

    it('should declare every path parameter', () => {
      forEachOperation(document, (name, operation, path) => {
        const pathParams = [...path.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
        const declared = (operation.parameters ?? [])
          .filter((parameter: any) => parameter.in === 'path')
          .map((parameter: any) => parameter.name);

        expect(declared, name).toEqual(pathParams);
      });
    });

    it('should only use declared tags, and use every declared tag', () => {
      const declared = openApiTags.map((tag) => tag.name);
      const used = new Set<string>();
      forEachOperation(document, (_name, operation) => operation.tags.forEach((tag: string) => used.add(tag)));

      expect([...used].sort()).toEqual([...declared].sort());
    });
  });

  describe('response schemas', () => {
    const SCALAR_TYPES: Record<string, (property: any) => boolean> = {
      String   : (property) => property.type === 'string' && property.format === undefined,
      Boolean  : (property) => property.type === 'boolean',
      DateTime : (property) => property.type === 'string' && property.format === 'date-time',
      Decimal  : (property) => property.type === 'string' && property.pattern !== undefined,
    };

    it.each(Prisma.dmmf.datamodel.models.map((model) => [model.name, model]))(
      'should document %s with the fields and JSON types of the Prisma model',
      (name, model) => {
        const schema = document.components.schemas[name];
        const fields = model.fields.filter((field) => field.kind === 'scalar' || field.kind === 'enum');

        expect(schema, `${name} response schema`).toBeDefined();
        expect(Object.keys(schema.properties).sort()).toEqual(fields.map((field) => field.name).sort());

        for (const field of fields) {
          const property = schema.properties[field.name];
          const matches = field.kind === 'enum'
            ? Array.isArray(property.enum)
            : SCALAR_TYPES[field.type]?.(property);

          expect(matches, `${name}.${field.name} (${field.type})`).toBe(true);
        }
      }
    );
  });
});
