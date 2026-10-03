import type { Router } from 'express';

export const API_BASE_PATH = '/v1/api';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

// Express 4 keeps the mount path of `router.use(path, subRouter)` only as a RegExp
// such as /^\/v1\/api\/ledgers\/?(?=\/|$)/i
function mountPath(regexp: RegExp): string {
  const match = /^\^(.*)\\\/\?\(\?=\\\/\|\$\)$/.exec(regexp.source);

  if (!match) {
    throw new Error(`Unsupported mount path: ${regexp.source}`);
  }

  return match[1].replace(/\\\//g, '/');
}

// Lists the routes registered on the root router as 'METHOD /path/{param}' (OpenAPI style)
export function listExpressRoutes(router: Router): string[] {
  const routes: string[] = [];

  for (const layer of (router as any).stack) {
    if (!layer.handle?.stack) continue;

    const prefix = mountPath(layer.regexp);

    for (const child of layer.handle.stack) {
      if (!child.route) continue;

      const suffix = child.route.path === '/' ? '' : child.route.path;
      const path = `${prefix}${suffix}`.replace(/:(\w+)/g, '{$1}');

      for (const method of Object.keys(child.route.methods)) {
        routes.push(`${method.toUpperCase()} ${path}`);
      }
    }
  }

  return routes.sort();
}

// Lists the operations of an OpenAPI document as 'METHOD /path/{param}', including the server base path
export function listDocumentedOperations(document: any): string[] {
  const operations: string[] = [];

  for (const [path, item] of Object.entries<any>(document.paths)) {
    for (const method of HTTP_METHODS) {
      if (item[method]) {
        operations.push(`${method.toUpperCase()} ${API_BASE_PATH}${path}`);
      }
    }
  }

  return operations.sort();
}

export function forEachOperation(
  document: any,
  callback: (name: string, operation: any, path: string, method: string) => void
) {
  for (const [path, item] of Object.entries<any>(document.paths)) {
    for (const method of HTTP_METHODS) {
      if (item[method]) {
        callback(`${method.toUpperCase()} ${path}`, item[method], path, method);
      }
    }
  }
}
