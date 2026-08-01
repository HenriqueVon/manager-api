import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialCategoryUseCase } from '../../usecases/delete-financial-category.usecase';
import type { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';

describe('DeleteFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: DeleteFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new DeleteFinancialCategoryUseCase(repo);
  });

  it('should delete financial category by id', async () => {
    (repo.delete as any).mockResolvedValue(undefined);

    const result = await sut.execute('category-1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('category-1');
    expect(result).toBeUndefined();
  });
});
