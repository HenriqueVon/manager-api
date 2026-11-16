import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFinancialFundTransactionUseCase } from '../../usecases/list-financial-fund-transaction.usecase';
import type { IFinancialFundTransactionRepository } from '../../repositories/ifinancial-fund-transaction.repository';

describe('ListFinancialFundTransactionUseCase', () => {
  let repo: IFinancialFundTransactionRepository;
  let sut: ListFinancialFundTransactionUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialFundTransactionRepository;

    sut = new ListFinancialFundTransactionUseCase(repo);
  });

  it('should return paginated financial fund transactions', async () => {
    const params = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'transactionDate',
      orderDirection : 'desc' as const,
    };

    const paginatedResult = {
      items: [
        {
          id                     : 'transaction-1',
          transactionDate        : new Date('2026-08-08T00:00:00.000Z'),
          amountCredit           : 100,
          amountDebit            : 0,
          additionalDescription  : 'SALARY',
          ledgerId               : 'ledger-1',
          financialDescriptionId : 'description-1',
          financialFundId        : 'fund-1',
          financialCategoryId    : 'category-1',
          financialBankAccountId : 'bank-account-1',
        },
      ],
      total: 1,
    };

    (repo.findMany as any).mockResolvedValue(paginatedResult);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith({}, params, { from: undefined, to: undefined });
    expect(result).toBe(paginatedResult);
  });

  it('should pass the ledger and the date range apart from the other filters', async () => {
    const params = { limit: 10 };
    (repo.findMany as any).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, {
      ledgerId            : 'ledger-1',
      transactionDateFrom : new Date('2026-01-01T00:00:00.000Z'),
      transactionDateTo   : new Date('2026-01-31T00:00:00.000Z'),
    });

    expect(repo.findMany).toHaveBeenCalledWith(
      { ledgerId: 'ledger-1' },
      params,
      { from: new Date('2026-01-01T00:00:00.000Z'), to: new Date('2026-01-31T00:00:00.000Z') }
    );
  });

  it('should pass a range with only one end', async () => {
    const params = { limit: 10 };
    (repo.findMany as any).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, { transactionDateFrom: new Date('2026-01-01T00:00:00.000Z') });

    expect(repo.findMany).toHaveBeenCalledWith({}, params, { from: new Date('2026-01-01T00:00:00.000Z'), to: undefined });
  });
});
