import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialDescription } from '@prisma/client';
import { ListFinancialDescriptionUseCase } from '../../usecases/list-financial-description.usecase';
import { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { ListFinancialDescriptionFiltersDto } from '../../dtos';

describe('ListFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: ListFinancialDescriptionUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new ListFinancialDescriptionUseCase(repo);
  });

  it('should return the paginated financial description list', async () => {
    const params: ListParamsDto = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'id',
      orderDirection : 'asc',
    };
    const page = { items: [{ id: 'record-1' } as unknown as FinancialDescription], total: 1 };

    vi.mocked(repo.findMany).mockResolvedValue(page);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledWith({}, params, undefined);
    expect(result).toBe(page);
  });

  it('should pass the filters to the repository, normalized', async () => {
    const params: ListParamsDto = { limit: 10 };
    const filters: ListFinancialDescriptionFiltersDto = {
      description: '  supermarket  ',
    };

    vi.mocked(repo.findMany).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, filters);

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        description: 'SUPERMARKET',
      },
      params,
      undefined
    );
  });

  it('should pass the search term to the repository apart from the filters', async () => {
    const params: ListParamsDto = { limit: 10 };
    const filters: ListFinancialDescriptionFiltersDto = { search: 'term' };

    vi.mocked(repo.findMany).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, filters);

    expect(repo.findMany).toHaveBeenCalledWith({}, params, 'term');
  });
});
