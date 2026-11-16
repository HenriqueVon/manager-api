import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialCategory } from '@prisma/client';
import { GetByIdFinancialCategoryUseCase } from '../../usecases/get-by-id-financial-category.usecase';
import { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';

describe('GetByIdFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: GetByIdFinancialCategoryUseCase;

  const id = 'record-1';
  const record = { id } as unknown as FinancialCategory;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new GetByIdFinancialCategoryUseCase(repo);
  });

  it('should return the financial category', async () => {
    vi.mocked(repo.findById).mockResolvedValue(record);

    const result = await sut.execute(id);

    expect(repo.findById).toHaveBeenCalledWith(id);
    expect(result).toBe(record);
  });

  it('should throw NotFoundError when the financial category does not exist', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    await expect(sut.execute(id)).rejects.toMatchObject({ statusCode: 404 });
  });
});
