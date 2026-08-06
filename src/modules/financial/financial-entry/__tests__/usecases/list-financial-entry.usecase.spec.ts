import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFinancialEntryUseCase } from '../../usecases/list-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('ListFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: ListFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialEntryRepository;

    sut = new ListFinancialEntryUseCase(repo);
  });

  it('should return paginated financial entries', async () => {
    const params = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'dueDate',
      orderDirection : 'asc' as const,
    };

    const paginatedResult = {
      items: [
        {
          id                     : 'entry-1',
          type                   : 'PAYABLE',
          dueDate                : new Date('2026-08-10T00:00:00.000Z'),
          paymentDate            : null,
          amount                 : 100,
          amountPaid             : 0,
          additionalDescription  : 'MONTHLY INTERNET',
          isMonthly              : true,
          ledgerId               : 'ledger-1',
          financialDescriptionId : 'description-1',
          financialFundId        : 'fund-1',
          financialCategoryId    : 'category-1',
        },
      ],
      total: 1,
    };

    (repo.findMany as any).mockResolvedValue(paginatedResult);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith({}, params);
    expect(result).toBe(paginatedResult);
  });
});
