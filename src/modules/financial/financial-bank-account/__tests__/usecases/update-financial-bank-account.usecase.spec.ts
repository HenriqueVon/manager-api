import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialBankAccountUseCase } from '../../usecases/update-financial-bank-account.usecase';
import type { IFinancialBankAccountRepository } from '../../repositories/ifinancial-bank-account.repository';

describe('UpdateFinancialBankAccountUseCase', () => {
  let repo: IFinancialBankAccountRepository;
  let sut: UpdateFinancialBankAccountUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      update     : vi.fn(),
    } as unknown as IFinancialBankAccountRepository;

    sut = new UpdateFinancialBankAccountUseCase(repo);
  });

  it('should update directly when name is undefined', async () => {
    const updatedFinancialBankAccount = {
      id                  : 'account-1',
      name                : 'REVOLUT',
      type                : 'PERSONAL',
      balance             : 1500,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.update as any).mockResolvedValue(updatedFinancialBankAccount);

    const input = {
      balance: 1500,
    } as any;

    const result = await sut.execute('account-1', input);

    expect(repo.findByName).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('account-1', input);
    expect(result).toBe(updatedFinancialBankAccount);
  });

  it('should trim + uppercase name, check uniqueness, then update', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const updatedFinancialBankAccount = {
      id                  : 'account-1',
      name                : 'ACTIVOBANK',
      type                : 'PERSONAL',
      balance             : 1000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.update as any).mockResolvedValue(updatedFinancialBankAccount);

    const input = {
      name    : '  activobank  ',
      balance : 1000,
    } as any;

    const result = await sut.execute('account-1', input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith('ACTIVOBANK');

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('account-1', {
      name    : 'ACTIVOBANK',
      balance : 1000,
    });

    expect(result).toBe(updatedFinancialBankAccount);
  });

  it('should allow update when existing account has the same id', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'account-1',
      name : 'REVOLUT',
    });

    const updatedFinancialBankAccount = {
      id                  : 'account-1',
      name                : 'REVOLUT',
      type                : 'PERSONAL',
      balance             : 2000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.update as any).mockResolvedValue(updatedFinancialBankAccount);

    const result = await sut.execute('account-1', {
      name    : ' revolut ',
      balance : 2000,
    } as any);

    expect(repo.findByName).toHaveBeenCalledWith('REVOLUT');
    expect(repo.update).toHaveBeenCalledWith('account-1', {
      name    : 'REVOLUT',
      balance : 2000,
    });
    expect(result).toBe(updatedFinancialBankAccount);
  });

  it('should throw ConflictError if name belongs to another account', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'another-account',
      name : 'REVOLUT',
    });

    await expect(
      sut.execute('account-1', {
        name: ' revolut ',
      } as any)
    ).rejects.toMatchObject({
      message: 'FinancialBankAccount name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('REVOLUT');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
