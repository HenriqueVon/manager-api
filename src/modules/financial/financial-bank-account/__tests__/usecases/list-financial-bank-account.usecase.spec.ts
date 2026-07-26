import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFinancialBankAccountUseCase } from '../../usecases/list-financial-bank-account.usecase';
import type { IFinancialBankAccountRepository } from '../../repositories/ifinancial-bank-account.repository';

describe('ListFinancialBankAccountUseCase', () => {
  let repo: IFinancialBankAccountRepository;
  let sut: ListFinancialBankAccountUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialBankAccountRepository;

    sut = new ListFinancialBankAccountUseCase(repo);
  });

  it('should return paginated financial bank accounts', async () => {
    const params = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'name',
      orderDirection : 'asc' as const,
    };

    const paginatedResult = {
      items: [
        {
          id                  : 'account-1',
          name                : 'ACTIVOBANK',
          type                : 'PERSONAL',
          balance             : 1000,
          ledgerId            : 'ledger-1',
          financialCurrencyId : 'currency-1',
        },
        {
          id                  : 'account-2',
          name                : 'REVOLUT',
          type                : 'PERSONAL',
          balance             : 2000,
          ledgerId            : 'ledger-1',
          financialCurrencyId : 'currency-1',
        },
      ],
      total: 2,
    };

    (repo.findMany as any).mockResolvedValue(paginatedResult);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith({}, params);
    expect(result).toBe(paginatedResult);
  });
});
