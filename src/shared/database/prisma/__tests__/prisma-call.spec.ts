import { describe, it, expect, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { prismaCall } from '../prisma-call';
import { ConflictError, NotFoundError } from '@shared/errors/app-error';

function knownRequestError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError('Prisma error', {
    code,
    clientVersion: 'test',
    meta,
  });
}

describe('prismaCall', () => {
  it('should return the result of the wrapped call', async () => {
    const result = await prismaCall(async () => ({ id: '1' }));

    expect(result).toEqual({ id: '1' });
  });

  it('should translate P2002 (unique constraint) into ConflictError', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const promise = prismaCall(async () => {
      throw knownRequestError('P2002', { modelName: 'Ledger', target: ['name'] });
    });

    await expect(promise).rejects.toBeInstanceOf(ConflictError);
  });

  it('should translate P2025 (record not found) into NotFoundError', async () => {
    const promise = prismaCall(async () => {
      throw knownRequestError('P2025');
    });

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  it('should rethrow other Prisma known errors unchanged', async () => {
    const error = knownRequestError('P2003');

    await expect(prismaCall(async () => {
      throw error;
    })).rejects.toBe(error);
  });

  it('should rethrow non-Prisma errors unchanged', async () => {
    const error = new Error('boom');

    await expect(prismaCall(async () => {
      throw error;
    })).rejects.toBe(error);
  });
});
