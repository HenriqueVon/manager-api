import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialDescriptionUseCase } from '../../usecases/delete-financial-description.usecase';
import { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';

describe('DeleteFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: DeleteFinancialDescriptionUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new DeleteFinancialDescriptionUseCase(repo);
  });

  it('should delete the financial description by id', async () => {
    vi.mocked(repo.delete).mockResolvedValue(undefined);

    await sut.execute('record-1');

    expect(repo.delete).toHaveBeenCalledWith('record-1');
  });
});
