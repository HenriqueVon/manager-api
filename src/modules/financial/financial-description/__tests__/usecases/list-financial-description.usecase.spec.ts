import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFinancialDescriptionUseCase } from '../../usecases/list-financial-description.usecase';
import type { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';

describe('ListFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: ListFinancialDescriptionUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new ListFinancialDescriptionUseCase(repo);
  });

  it('should return paginated financial descriptions', async () => {
    const params = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'description',
      orderDirection : 'asc' as const,
    };

    const paginatedResult = {
      data: [
        {
          id          : '1',
          description : 'ELECTRICITY',
        },
        {
          id          : '2',
          description : 'SUPERMARKET',
        },
      ],
      total  : 2,
      limit  : 10,
      offset : 0,
    };

    (repo.findMany as any).mockResolvedValue(paginatedResult);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith({}, params);

    expect(result).toBe(paginatedResult);
  });
});