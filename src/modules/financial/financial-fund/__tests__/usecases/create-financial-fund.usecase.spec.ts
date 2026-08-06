import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialFundUseCase } from '../../usecases/create-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';

describe('CreateFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: CreateFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      create     : vi.fn(),
    } as unknown as IFinancialFundRepository;

    sut = new CreateFinancialFundUseCase(repo);
  });

  it('should trim + uppercase name, check uniqueness, then create', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const createdFinancialFund = {
      id                  : 'fund-1',
      name                : 'BASIC EXPENSES',
      balance             : 1000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.create as any).mockResolvedValue(createdFinancialFund);

    const input = {
      name                : '  basic expenses  ',
      balance             : 1000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    } as any;

    const result = await sut.execute(input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith('BASIC EXPENSES');
    expect(repo.create).toHaveBeenCalledWith({
      ...input,
      name: 'BASIC EXPENSES',
    });
    expect(result).toBe(createdFinancialFund);
  });

  it('should throw ConflictError if name already exists', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'existing-fund',
      name : 'BASIC EXPENSES',
    });

    const input = {
      name                : ' basic expenses ',
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
      message: 'FinancialFund name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('BASIC EXPENSES');
    expect(repo.create).not.toHaveBeenCalled();
  });
});
