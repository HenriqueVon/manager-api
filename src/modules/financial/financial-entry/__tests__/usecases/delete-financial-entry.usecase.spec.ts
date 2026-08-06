import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialEntryUseCase } from '../../usecases/delete-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('DeleteFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: DeleteFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialEntryRepository;

    sut = new DeleteFinancialEntryUseCase(repo);
  });

  it('should delete financial entry by id', async () => {
    (repo.delete as any).mockResolvedValue(undefined);

    const result = await sut.execute('entry-1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('entry-1');
    expect(result).toBeUndefined();
  });
});
