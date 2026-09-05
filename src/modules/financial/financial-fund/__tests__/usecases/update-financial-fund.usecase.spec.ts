import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialFundUseCase } from '../../usecases/update-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';

describe('UpdateFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: UpdateFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      findMany : vi.fn(),
      update   : vi.fn(),
    } as unknown as IFinancialFundRepository;

    sut = new UpdateFinancialFundUseCase(repo);
  });

  it('should update directly when name is undefined', async () => {
    const updatedFinancialFund = {
      id                  : 'fund-1',
      name                : 'BASIC EXPENSES',
      balance             : 1500,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.update as any).mockResolvedValue(updatedFinancialFund);

    const input = {
      balance: 1500,
    } as any;

    const result = await sut.execute('fund-1', input);

    expect(repo.findMany).not.toHaveBeenCalled();

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(
      'fund-1',
      input
    );

    expect(result).toBe(updatedFinancialFund);
  });

  it('should trim + uppercase name, check uniqueness by ledgerId and name, then update', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });

    const updatedFinancialFund = {
      id                  : 'fund-1',
      name                : 'VACATION',
      balance             : 2000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.update as any).mockResolvedValue(updatedFinancialFund);

    const input = {
      name     : '  vacation  ',
      balance  : 2000,
      ledgerId : 'ledger-1',
    } as any;

    const result = await sut.execute('fund-1', input);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId : 'ledger-1',
        name     : 'VACATION',
      },
      {
        limit: 1,
      }
    );

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(
      'fund-1',
      {
        name     : 'VACATION',
        balance  : 2000,
        ledgerId : 'ledger-1',
      }
    );

    expect(result).toBe(updatedFinancialFund);
  });

  it('should allow update when existing fund has the same id', async () => {
    (repo.findMany as any).mockResolvedValue({
      items: [
        {
          id                  : 'fund-1',
          name                : 'BASIC EXPENSES',
          balance             : 0,
          ledgerId            : 'ledger-1',
          financialCurrencyId : 'currency-1',
        },
      ],
      total: 1,
    });

    (repo.update as any).mockResolvedValue({
      id: 'fund-1',
    });

    const input = {
      name     : ' basic expenses ',
      ledgerId : 'ledger-1',
    } as any;

    await sut.execute('fund-1', input);

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId : 'ledger-1',
        name     : 'BASIC EXPENSES',
      },
      {
        limit: 1,
      }
    );

    expect(repo.update).toHaveBeenCalledWith(
      'fund-1',
      {
        name     : 'BASIC EXPENSES',
        ledgerId : 'ledger-1',
      }
    );
  });

  it('should throw ConflictError if name belongs to another fund in the same ledger', async () => {
    (repo.findMany as any).mockResolvedValue({
      items: [
        {
          id                  : 'another-fund',
          name                : 'BASIC EXPENSES',
          balance             : 0,
          ledgerId            : 'ledger-1',
          financialCurrencyId : 'currency-1',
        },
      ],
      total: 1,
    });

    const input = {
      name     : ' basic expenses ',
      ledgerId : 'ledger-1',
    } as any;

    await expect(
      sut.execute('fund-1', input)
    ).rejects.toMatchObject({
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

    expect(repo.update).not.toHaveBeenCalled();
  });
});