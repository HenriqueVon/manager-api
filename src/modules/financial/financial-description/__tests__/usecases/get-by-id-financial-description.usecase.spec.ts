import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetByIdFinancialDescriptionUseCase } from '../../usecases/get-by-id-financial-description.usecase';
import type { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';
import { NotFoundError } from '@shared/errors/app-error';

describe('GetByIdFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: GetByIdFinancialDescriptionUseCase;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new GetByIdFinancialDescriptionUseCase(repo);
  });

  it('should return financial description when it exists', async () => {
    const financialDescription = {
      id          : '1',
      description : 'SUPERMARKET',
    };

    (repo.findById as any).mockResolvedValue(
      financialDescription
    );

    const result = await sut.execute('1');

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('1');

    expect(result).toBe(financialDescription);
  });

  it('should throw NotFoundError when financial description does not exist', async () => {
    (repo.findById as any).mockResolvedValue(null);

    await expect(sut.execute('1')).rejects.toBeInstanceOf(
      NotFoundError
    );

    expect(repo.findById).toHaveBeenCalledWith('1');
  });
});