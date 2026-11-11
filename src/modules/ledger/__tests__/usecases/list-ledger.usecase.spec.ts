import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Ledger } from '@prisma/client';
import { ListLedgerUseCase } from '../../usecases/list-ledger.usecase';
import { ILedgerRepository } from '../../repositories/iledger.repository';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { ListLedgerFiltersDto } from '../../dtos';

describe('ListLedgerUseCase', () => {
  let repo: ILedgerRepository;
  let sut: ListLedgerUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as ILedgerRepository;

    sut = new ListLedgerUseCase(repo);
  });

  it('should return the paginated ledger list', async () => {
    const params: ListParamsDto = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'id',
      orderDirection : 'asc',
    };
    const page = { items: [{ id: 'record-1' } as unknown as Ledger], total: 1 };

    vi.mocked(repo.findMany).mockResolvedValue(page);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledWith({}, params, undefined);
    expect(result).toBe(page);
  });

  it('should pass the filters to the repository, normalized', async () => {
    const params: ListParamsDto = { limit: 10 };
    const filters: ListLedgerFiltersDto = {
      name: '  europe  ',
    };

    vi.mocked(repo.findMany).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, filters);

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        name: 'EUROPE',
      },
      params,
      undefined
    );
  });

  it('should pass the search term to the repository apart from the filters', async () => {
    const params: ListParamsDto = { limit: 10 };
    const filters: ListLedgerFiltersDto = { search: 'term' };

    vi.mocked(repo.findMany).mockResolvedValue({ items: [], total: 0 });

    await sut.execute(params, filters);

    expect(repo.findMany).toHaveBeenCalledWith({}, params, 'term');
  });
});
