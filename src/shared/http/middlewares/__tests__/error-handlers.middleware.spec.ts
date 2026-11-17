import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { errorHandler } from '../error-handlers.middleware';
import { NotFoundError, ResourcesNotFoundError } from '@shared/errors/app-error';

function respond(error: unknown) {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status, set: vi.fn() } as unknown as Response;

  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  errorHandler(error, { path: '/x', method: 'POST' } as Request, res, vi.fn());

  return { status, json };
}

describe('errorHandler', () => {
  it('should list the ids that do not exist in the 404 of a request for several records', () => {
    const { status, json } = respond(new ResourcesNotFoundError(['a', 'b']));

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Some resources were not found', code: 'NOT_FOUND', ids: ['a', 'b'] });
  });

  it('should not add ids to any other error', () => {
    const { status, json } = respond(new NotFoundError());

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Resource not found', code: 'NOT_FOUND' });
  });
});
