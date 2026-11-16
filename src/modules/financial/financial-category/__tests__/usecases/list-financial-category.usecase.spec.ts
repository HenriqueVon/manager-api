import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialCategory } from '@prisma/client';
import { ListFinancialCategoryUseCase } from '../../usecases/list-financial-category.usecase';
import { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { ListFinancialCategoryFiltersDto } from '../../dtos';

describe('ListFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: ListFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new ListFinancialCategoryUseCase(repo);
  });

  it('should return the paginated financial category list', async () => {
    const params: ListParamsDto = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'id',
      orderDirection : 'asc',
    };
    const page = { items: [{ id: 'record-1' } as unknown as FinancialCategory], total: 1 };

    vi.mocked(repo.findMany).mockResolvedValue(page);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledWith({}, params, undefined);
    expect(result).toBe(page);
  });

  it('should pass the filters to the repository, normalized', async () => {
    const params: ListParamsDto = { limit: 10 };
    const filters: ListFinancialCategoryFiltersDto = {
      name     : '  supermarket  ',
      ledgerId : 'ledger-1',
    };

    vi.mocked(repo.findMany).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, filters);

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        name     : 'SUPERMARKET',
        ledgerId : 'ledger-1',
      },
      params,
      undefined
    );
  });

  it('should pass the search term to the repository apart from the filters', async () => {
    const params: ListParamsDto = { limit: 10 };
    const filters: ListFinancialCategoryFiltersDto = { search: 'term' };

    vi.mocked(repo.findMany).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, filters);

    expect(repo.findMany).toHaveBeenCalledWith({}, params, 'term');
  });
});
