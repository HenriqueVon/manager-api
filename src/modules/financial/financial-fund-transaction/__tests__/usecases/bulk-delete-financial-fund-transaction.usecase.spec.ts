import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BulkDeleteFinancialFundTransactionUseCase } from '../../usecases/bulk-delete-financial-fund-transaction.usecase';
import type { IFinancialFundTransactionRepository } from '../../repositories/ifinancial-fund-transaction.repository';
import { ResourcesNotFoundError } from '@shared/errors/app-error';

describe('BulkDeleteFinancialFundTransactionUseCase', () => {
  let repo: IFinancialFundTransactionRepository;
  let sut: BulkDeleteFinancialFundTransactionUseCase;

  beforeEach(() => {
    repo = {
      findExistingIds : vi.fn(),
      deleteMany      : vi.fn().mockResolvedValue(undefined),
    } as unknown as IFinancialFundTransactionRepository;

    sut = new BulkDeleteFinancialFundTransactionUseCase(repo);
  });

  it('should delete the records when all the ids exist', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['id-1', 'id-2']);

    await sut.execute({ ids: ['id-1', 'id-2'] });

    expect(repo.findExistingIds).toHaveBeenCalledWith(['id-1', 'id-2']);
    expect(repo.deleteMany).toHaveBeenCalledTimes(1);
    expect(repo.deleteMany).toHaveBeenCalledWith(['id-1', 'id-2']);
  });

  it('should delete nothing and list the ids that do not exist', async () => {
    (repo.findExistingIds as any).mockResolvedValue(['id-2']);

    const error = await sut.execute({ ids: ['id-1', 'id-2', 'id-3'] }).catch((failure) => failure);

    expect(error).toBeInstanceOf(ResourcesNotFoundError);
    expect(error.statusCode).toBe(404);
    expect(error.ids).toEqual(['id-1', 'id-3']);
    expect(repo.deleteMany).not.toHaveBeenCalled();
  });
});
