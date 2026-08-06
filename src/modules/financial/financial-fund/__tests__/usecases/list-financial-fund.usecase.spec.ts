import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFinancialFundUseCase } from '../../usecases/list-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';

describe('ListFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: ListFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialFundRepository;

    sut = new ListFinancialFundUseCase(repo);
  });

  it('should return paginated financial funds', async () => {
    const params = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'name',
      orderDirection : 'asc' as const,
    };
    const paginatedResult = {
      items: [
        { id: 'fund-1', name: 'BASIC EXPENSES' },
        { id: 'fund-2', name: 'VACATION' },
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
