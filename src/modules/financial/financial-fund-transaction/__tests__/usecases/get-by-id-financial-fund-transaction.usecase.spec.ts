import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetByIdFinancialFundTransactionUseCase } from '../../usecases/get-by-id-financial-fund-transaction.usecase';
import type { IFinancialFundTransactionRepository } from '../../repositories/ifinancial-fund-transaction.repository';
import { NotFoundError } from '@shared/errors/app-error';

describe('GetByIdFinancialFundTransactionUseCase', () => {
  let repo: IFinancialFundTransactionRepository;
  let sut: GetByIdFinancialFundTransactionUseCase;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialFundTransactionRepository;

    sut = new GetByIdFinancialFundTransactionUseCase(repo);
  });

  it('should return financial fund transaction when it exists', async () => {
    const transaction = {
      id                     : 'transaction-1',
      transactionDate        : new Date('2026-08-08T00:00:00.000Z'),
      amountCredit           : 100,
      amountDebit            : 0,
      additionalDescription  : 'SALARY',
      ledgerId               : 'ledger-1',
      financialDescriptionId : 'description-1',
      financialFundId        : 'fund-1',
      financialCategoryId    : 'category-1',
      financialBankAccountId : 'bank-account-1',
    };

    (repo.findById as any).mockResolvedValue(transaction);

    const result = await sut.execute('transaction-1');

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('transaction-1');
    expect(result).toBe(transaction);
  });

  it('should throw NotFoundError when transaction does not exist', async () => {
    (repo.findById as any).mockResolvedValue(null);

    await expect(
      sut.execute('transaction-1')
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(repo.findById).toHaveBeenCalledWith('transaction-1');
  });
});
