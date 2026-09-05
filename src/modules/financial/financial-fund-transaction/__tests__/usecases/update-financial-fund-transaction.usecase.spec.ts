import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialFundTransactionUseCase } from '../../usecases/update-financial-fund-transaction.usecase';
import type { IFinancialFundTransactionRepository } from '../../repositories/ifinancial-fund-transaction.repository';

describe('UpdateFinancialFundTransactionUseCase', () => {
  let repo: IFinancialFundTransactionRepository;
  let sut: UpdateFinancialFundTransactionUseCase;

  beforeEach(() => {
    repo = {
      update: vi.fn(),
    } as unknown as IFinancialFundTransactionRepository;

    sut = new UpdateFinancialFundTransactionUseCase(repo);
  });

  it('should update a transaction with credit only', async () => {
    const input = {
      amountCredit : 150,
      amountDebit  : 0,
    } as any;

    const updatedTransaction = {
      id: 'transaction-1',
      ...input,
    };

    (repo.update as any).mockResolvedValue(updatedTransaction);

    const result = await sut.execute('transaction-1', input);

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('transaction-1', input);
    expect(result).toBe(updatedTransaction);
  });

  it('should update a transaction with debit only', async () => {
    const input = {
      amountCredit : 0,
      amountDebit  : 90,
    } as any;

    const updatedTransaction = {
      id: 'transaction-1',
      ...input,
    };

    (repo.update as any).mockResolvedValue(updatedTransaction);

    const result = await sut.execute('transaction-1', input);

    expect(repo.update).toHaveBeenCalledWith('transaction-1', input);
    expect(result).toBe(updatedTransaction);
  });

  it('should allow updating non-amount fields when amounts are undefined', async () => {
    const input = {
      additionalDescription: 'UPDATED DESCRIPTION',
    } as any;

    const updatedTransaction = {
      id: 'transaction-1',
      ...input,
    };

    (repo.update as any).mockResolvedValue(updatedTransaction);

    const result = await sut.execute('transaction-1', input);

    expect(repo.update).toHaveBeenCalledWith('transaction-1', input);
    expect(result).toBe(updatedTransaction);
  });

  it('should reject when credit and debit are both greater than 0', async () => {
    const input = {
      amountCredit : 100,
      amountDebit  : 50,
    } as any;

    await expect(
      sut.execute('transaction-1', input)
    ).rejects.toMatchObject({
      message:
        'Both amountCredit and amountDebit cannot be greater than 0 at the same time',
    });

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should reject when credit and debit are both 0', async () => {
    const input = {
      amountCredit : 0,
      amountDebit  : 0,
    } as any;

    await expect(
      sut.execute('transaction-1', input)
    ).rejects.toMatchObject({
      message:
        'Both amountCredit and amountDebit cannot be 0 at the same time',
    });

    expect(repo.update).not.toHaveBeenCalled();
  });
});
