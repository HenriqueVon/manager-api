import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialDescriptionUseCase } from '../../usecases/delete-financial-description.usecase';
import type { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';

describe('DeleteFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: DeleteFinancialDescriptionUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new DeleteFinancialDescriptionUseCase(repo);
  });

  it('should delete financial description by id', async () => {
    (repo.delete as any).mockResolvedValue(undefined);

    const result = await sut.execute('1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('1');

    expect(result).toBeUndefined();
  });
});