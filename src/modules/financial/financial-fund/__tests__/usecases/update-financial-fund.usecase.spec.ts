import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialFundUseCase } from '../../usecases/update-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';

describe('UpdateFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: UpdateFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      update     : vi.fn(),
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

    const input = { balance: 1500 } as any;
    const result = await sut.execute('fund-1', input);

    expect(repo.findByName).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith('fund-1', input);
    expect(result).toBe(updatedFinancialFund);
  });

  it('should trim + uppercase name, check uniqueness, then update', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const updatedFinancialFund = {
      id                  : 'fund-1',
      name                : 'VACATION',
      balance             : 2000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.update as any).mockResolvedValue(updatedFinancialFund);

    const input = {
      name    : '  vacation  ',
      balance : 2000,
    } as any;

    const result = await sut.execute('fund-1', input);

    expect(repo.findByName).toHaveBeenCalledWith('VACATION');
    expect(repo.update).toHaveBeenCalledWith('fund-1', {
      name    : 'VACATION',
      balance : 2000,
    });
    expect(result).toBe(updatedFinancialFund);
  });

  it('should allow update when existing fund has the same id', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'fund-1',
      name : 'BASIC EXPENSES',
    });
    (repo.update as any).mockResolvedValue({ id: 'fund-1' });

    await sut.execute('fund-1', {
      name: ' basic expenses ',
    } as any);

    expect(repo.update).toHaveBeenCalledWith('fund-1', {
      name: 'BASIC EXPENSES',
    });
  });

  it('should throw ConflictError if name belongs to another fund', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'another-fund',
      name : 'BASIC EXPENSES',
    });

    await expect(
      sut.execute('fund-1', { name: ' basic expenses ' } as any)
    ).rejects.toMatchObject({
      message: 'FinancialFund name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('BASIC EXPENSES');
    expect(repo.update).not.toHaveBeenCalled();
  });
});
