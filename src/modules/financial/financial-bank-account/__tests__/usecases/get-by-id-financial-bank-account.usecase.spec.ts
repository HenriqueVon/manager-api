import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetByIdFinancialBankAccountUseCase } from '../../usecases/get-by-id-financial-bank-account.usecase';
import type { IFinancialBankAccountRepository } from '../../repositories/ifinancial-bank-account.repository';
import { NotFoundError } from '@shared/errors/app-error';

describe('GetByIdFinancialBankAccountUseCase', () => {
  let repo: IFinancialBankAccountRepository;
  let sut: GetByIdFinancialBankAccountUseCase;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialBankAccountRepository;

    sut = new GetByIdFinancialBankAccountUseCase(repo);
  });

  it('should return financial bank account when it exists', async () => {
    const financialBankAccount = {
      id                  : 'account-1',
      name                : 'REVOLUT',
      type                : 'PERSONAL',
      balance             : 1000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.findById as any).mockResolvedValue(financialBankAccount);

    const result = await sut.execute('account-1');

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('account-1');
    expect(result).toBe(financialBankAccount);
  });

  it('should throw NotFoundError when financial bank account does not exist', async () => {
    (repo.findById as any).mockResolvedValue(null);

    await expect(
      sut.execute('account-1')
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(repo.findById).toHaveBeenCalledWith('account-1');
  });
});
