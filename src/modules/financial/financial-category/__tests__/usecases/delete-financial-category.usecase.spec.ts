import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialCategoryUseCase } from '../../usecases/delete-financial-category.usecase';
import { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';

describe('DeleteFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: DeleteFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new DeleteFinancialCategoryUseCase(repo);
  });

  it('should delete the financial category by id', async () => {
    vi.mocked(repo.delete).mockResolvedValue(undefined);

    await sut.execute('record-1');

    expect(repo.delete).toHaveBeenCalledWith('record-1');
  });
});
