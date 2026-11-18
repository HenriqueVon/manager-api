import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { errorHandler } from '../error-handlers.middleware';
import { ConflictError, NotFoundError, ResourcesAlreadyPaidError, ResourcesInUseError, ResourcesNotFoundError } from '@shared/errors/app-error';

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

  it('should list the ids that are in use in the 409 of a request for several records', () => {
    const { status, json } = respond(new ResourcesInUseError(['a']));

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Some resources are in use', code: 'CONFLICT', ids: ['a'] });
  });

  it('should list the ids that are already paid in the 409 of a request for several records', () => {
    const { status, json } = respond(new ResourcesAlreadyPaidError(['a']));

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Some resources are already paid', code: 'CONFLICT', ids: ['a'] });
  });

  it('should not add ids to any other error', () => {
    const { status, json } = respond(new NotFoundError());

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ message: 'Resource not found', code: 'NOT_FOUND' });

    const conflict = respond(new ConflictError());
    expect(conflict.json).toHaveBeenCalledWith({ message: 'Resource already exists', code: 'CONFLICT' });
  });
});
