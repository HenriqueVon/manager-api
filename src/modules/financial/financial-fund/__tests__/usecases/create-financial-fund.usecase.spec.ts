import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialFundUseCase } from '../../usecases/create-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';

describe('CreateFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: CreateFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      findMany : vi.fn(),
      create   : vi.fn(),
    } as unknown as IFinancialFundRepository;

    sut = new CreateFinancialFundUseCase(repo);
  });

  it('should trim + uppercase name, check uniqueness by ledgerId and name, then create', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });

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

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId : 'ledger-1',
        name     : 'BASIC EXPENSES',
      },
      {
        limit: 1,
      }
    );

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      ...input,
      name: 'BASIC EXPENSES',
    });

    expect(result).toBe(createdFinancialFund);
  });

  it('should throw ConflictError if name already exists in the same ledger', async () => {
    (repo.findMany as any).mockResolvedValue({
      items: [
        {
          id                  : 'existing-fund',
          name                : 'BASIC EXPENSES',
          balance             : 0,
          ledgerId            : 'ledger-1',
          financialCurrencyId : 'currency-1',
        },
      ],
      total: 1,
    });

    const input = {
      name                : ' basic expenses ',
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
      message: 'FinancialFund name already exists!',
    });

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId : 'ledger-1',
        name     : 'BASIC EXPENSES',
      },
      {
        limit: 1,
      }
    );

    expect(repo.create).not.toHaveBeenCalled();
  });
});