import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialFundTransactionUseCase } from '../../usecases/delete-financial-fund-transaction.usecase';
import type { IFinancialFundTransactionRepository } from '../../repositories/ifinancial-fund-transaction.repository';

describe('DeleteFinancialFundTransactionUseCase', () => {
  let repo: IFinancialFundTransactionRepository;
  let sut: DeleteFinancialFundTransactionUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialFundTransactionRepository;

    sut = new DeleteFinancialFundTransactionUseCase(repo);
  });

  it('should delete financial fund transaction by id', async () => {
    (repo.delete as any).mockResolvedValue(undefined);

    const result = await sut.execute('transaction-1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('transaction-1');
    expect(result).toBeUndefined();
  });
});
