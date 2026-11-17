import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BulkDeleteFinancialEntryUseCase } from '../../usecases/bulk-delete-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';
import { ResourcesNotFoundError } from '@shared/errors/app-error';

describe('BulkDeleteFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: BulkDeleteFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      findExistingIds : vi.fn(),
      deleteMany      : vi.fn().mockResolvedValue(undefined),
    } as unknown as IFinancialEntryRepository;

    sut = new BulkDeleteFinancialEntryUseCase(repo);
  });

  it('should delete the entries when all the ids exist', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['entry-1', 'entry-2']);

    await sut.execute({ ids: ['entry-1', 'entry-2'] });

    expect(repo.findExistingIds).toHaveBeenCalledWith(['entry-1', 'entry-2']);
    expect(repo.deleteMany).toHaveBeenCalledTimes(1);
    expect(repo.deleteMany).toHaveBeenCalledWith(['entry-1', 'entry-2']);
  });

  it('should delete nothing and list the ids that do not exist', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['entry-2']);

    const error = await sut.execute({ ids: ['entry-1', 'entry-2', 'entry-3'] }).catch((failure) => failure);

    expect(error).toBeInstanceOf(ResourcesNotFoundError);
    expect(error.statusCode).toBe(404);
    expect(error.ids).toEqual(['entry-1', 'entry-3']);
    expect(repo.deleteMany).not.toHaveBeenCalled();
  });

  it('should list every id when none exists', async () => {
    (repo.findExistingIds as any).mockResolvedValue([]);

    const error = await sut.execute({ ids: ['entry-1', 'entry-2'] }).catch((failure) => failure);

    expect(error.ids).toEqual(['entry-1', 'entry-2']);
    expect(repo.deleteMany).not.toHaveBeenCalled();
  });
});
