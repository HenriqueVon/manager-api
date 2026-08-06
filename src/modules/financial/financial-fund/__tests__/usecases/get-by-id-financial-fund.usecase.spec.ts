import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetByIdFinancialFundUseCase } from '../../usecases/get-by-id-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';
import { NotFoundError } from '@shared/errors/app-error';

describe('GetByIdFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: GetByIdFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialFundRepository;

    sut = new GetByIdFinancialFundUseCase(repo);
  });

  it('should return financial fund when it exists', async () => {
    const financialFund = {
      id                  : 'fund-1',
      name                : 'BASIC EXPENSES',
      balance             : 1000,
      ledgerId            : 'ledger-1',
      financialCurrencyId : 'currency-1',
    };

    (repo.findById as any).mockResolvedValue(financialFund);

    const result = await sut.execute('fund-1');

    expect(repo.findById).toHaveBeenCalledWith('fund-1');
    expect(result).toBe(financialFund);
  });

  it('should throw NotFoundError when financial fund does not exist', async () => {
    (repo.findById as any).mockResolvedValue(null);

    await expect(sut.execute('fund-1')).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.findById).toHaveBeenCalledWith('fund-1');
  });
});
