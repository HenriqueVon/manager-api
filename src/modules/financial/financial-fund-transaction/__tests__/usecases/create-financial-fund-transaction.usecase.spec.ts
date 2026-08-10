import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialFundTransactionUseCase } from '../../usecases/create-financial-fund-transaction.usecase';
import type { IFinancialFundTransactionRepository } from '../../repositories/ifinancial-fund-transaction.repository';
import { BadRequestError } from '@shared/errors/app-error';

describe('CreateFinancialFundTransactionUseCase', () => {
  let repo: IFinancialFundTransactionRepository;
  let sut: CreateFinancialFundTransactionUseCase;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
    } as unknown as IFinancialFundTransactionRepository;

    sut = new CreateFinancialFundTransactionUseCase(repo);
  });

  it('should create a credit transaction', async () => {
    const input = {
      transactionDate        : new Date('2026-08-08T00:00:00.000Z'),
      amountCredit           : 100,
      amountDebit            : 0,
      additionalDescription  : 'SALARY',
      ledgerId               : 'ledger-1',
      financialDescriptionId : 'description-1',
      financialFundId        : 'fund-1',
      financialCategoryId    : 'category-1',
      financialBankAccountId : 'bank-account-1',
    } as any;

    const createdTransaction = {
      id: 'transaction-1',
      ...input,
    };

    (repo.create as any).mockResolvedValue(createdTransaction);

    const result = await sut.execute(input);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(input);
    expect(result).toBe(createdTransaction);
  });

  it('should create a debit transaction', async () => {
    const input = {
      transactionDate        : new Date('2026-08-08T00:00:00.000Z'),
      amountCredit           : 0,
      amountDebit            : 75,
      additionalDescription  : 'SUPERMARKET',
      ledgerId               : 'ledger-1',
      financialDescriptionId : 'description-1',
      financialFundId        : 'fund-1',
      financialCategoryId    : 'category-1',
      financialBankAccountId : 'bank-account-1',
    } as any;

    const createdTransaction = {
      id: 'transaction-1',
      ...input,
    };

    (repo.create as any).mockResolvedValue(createdTransaction);

    const result = await sut.execute(input);

    expect(repo.create).toHaveBeenCalledWith(input);
    expect(result).toBe(createdTransaction);
  });

  it('should throw BadRequestError when credit and debit are both greater than 0', async () => {
    const input = {
      amountCredit : 100,
      amountDebit  : 50,
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
      message:
        'Both amountCredit and amountDebit cannot be greater than 0 at the same time',
    });

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestError when credit and debit are both 0', async () => {
    const input = {
      amountCredit : 0,
      amountDebit  : 0,
    } as any;

    await expect(sut.execute(input)).rejects.toBeInstanceOf(BadRequestError);

    await expect(sut.execute(input)).rejects.toMatchObject({
      message:
        'Both amountCredit and amountDebit cannot be 0 at the same time',
    });

    expect(repo.create).not.toHaveBeenCalled();
  });
});
