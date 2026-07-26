import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialBankAccountUseCase } from '../../usecases/create-financial-bank-account.usecase';
import type { IFinancialBankAccountRepository } from '../../repositories/ifinancial-bank-account.repository';

describe('CreateFinancialBankAccountUseCase', () => {
  let repo: IFinancialBankAccountRepository;
  let sut: CreateFinancialBankAccountUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      create     : vi.fn(),
    } as unknown as IFinancialBankAccountRepository;

    sut = new CreateFinancialBankAccountUseCase(repo);
  });

  it('should trim + uppercase name, check uniqueness, then create', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const createdFinancialBankAccount = {
      id                  : 'account-1',
      name                : 'REVOLUT',
      type                : 'PERSONAL',
      balance             : 1000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.create as any).mockResolvedValue(createdFinancialBankAccount);

    const input = {
      name                : '  revolut  ',
      type                : 'PERSONAL',
      balance             : 1000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    } as any;

    const result = await sut.execute(input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith('REVOLUT');

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      ...input,
      name: 'REVOLUT',
    });

    expect(result).toBe(createdFinancialBankAccount);
  });

  it('should throw ConflictError if name already exists', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'existing-account',
      name : 'REVOLUT',
    });

    const input = {
      name                : ' revolut ',
      type                : 'PERSONAL',
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
      message: 'FinancialBankAccount name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('REVOLUT');
    expect(repo.create).not.toHaveBeenCalled();
  });
});
