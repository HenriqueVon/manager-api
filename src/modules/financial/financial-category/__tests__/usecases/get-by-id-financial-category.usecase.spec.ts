import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetByIdFinancialCategoryUseCase } from '../../usecases/get-by-id-financial-category.usecase';
import type { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';
import { NotFoundError } from '@shared/errors/app-error';

describe('GetByIdFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: GetByIdFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new GetByIdFinancialCategoryUseCase(repo);
  });

  it('should return financial category when it exists', async () => {
    const financialCategory = {
      id               : 'category-1',
      name             : 'SUPERMARKET',
      type             : 'EXPENSE',
      balance          : 100,
      ledgerId         : 'ledger-1',
      parentCategoryId : 'parent-category-1',
    };

    (repo.findById as any).mockResolvedValue(financialCategory);

    const result = await sut.execute('category-1');

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('category-1');
    expect(result).toBe(financialCategory);
  });

  it('should throw NotFoundError when financial category does not exist', async () => {
    (repo.findById as any).mockResolvedValue(null);

    await expect(
      sut.execute('category-1')
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(repo.findById).toHaveBeenCalledWith('category-1');
  });
});
