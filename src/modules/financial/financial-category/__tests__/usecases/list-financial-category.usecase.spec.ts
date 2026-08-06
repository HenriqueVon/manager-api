import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFinancialCategoryUseCase } from '../../usecases/list-financial-category.usecase';
import type { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';

describe('ListFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: ListFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new ListFinancialCategoryUseCase(repo);
  });

  it('should return paginated financial categories', async () => {
    const params = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'name',
      orderDirection : 'asc' as const,
    };

    const paginatedResult = {
      items: [
        {
          id               : 'category-1',
          name             : 'EXPENSES',
          type             : 'EXPENSE',
          balance          : 0,
          ledgerId         : 'ledger-1',
          parentCategoryId : null,
        },
        {
          id               : 'category-2',
          name             : 'SUPERMARKET',
          type             : 'EXPENSE',
          balance          : 100,
          ledgerId         : 'ledger-1',
          parentCategoryId : 'category-1',
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
