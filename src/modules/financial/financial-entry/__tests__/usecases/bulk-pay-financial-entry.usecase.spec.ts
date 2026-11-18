import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BulkPayFinancialEntryUseCase } from '../../usecases/bulk-pay-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';
import { ResourcesAlreadyPaidError, ResourcesNotFoundError } from '@shared/errors/app-error';

describe('BulkPayFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: BulkPayFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      payMany: vi.fn().mockResolvedValue({ missingIds: [], paidIds: [] }),
    } as unknown as IFinancialEntryRepository;

    sut = new BulkPayFinancialEntryUseCase(repo);
  });

  it('should ask the repository to pay the ids and return nothing', async () => {
    await expect(sut.execute({ ids: ['a', 'b'] })).resolves.toBeUndefined();

    expect(repo.payMany).toHaveBeenCalledWith(['a', 'b']);
  });

  it('should list the ids that do not exist in a 404', async () => {
    (repo.payMany as any).mockResolvedValue({ missingIds: ['b'], paidIds: [] });

    const failure = await sut.execute({ ids: ['a', 'b'] }).catch((error) => error);

    expect(failure).toBeInstanceOf(ResourcesNotFoundError);
    expect(failure.ids).toEqual(['b']);
  });

  it('should list the ids that are already paid in a 409', async () => {
    (repo.payMany as any).mockResolvedValue({ missingIds: [], paidIds: ['a'] });

    const failure = await sut.execute({ ids: ['a', 'b'] }).catch((error) => error);

    expect(failure).toBeInstanceOf(ResourcesAlreadyPaidError);
    expect(failure.ids).toEqual(['a']);
    expect(failure.statusCode).toBe(409);
  });

  it('should report the missing ids first when some are missing and others are paid', async () => {
    (repo.payMany as any).mockResolvedValue({ missingIds: ['c'], paidIds: ['a'] });

    await expect(sut.execute({ ids: ['a', 'b', 'c'] })).rejects.toBeInstanceOf(ResourcesNotFoundError);
  });
});
