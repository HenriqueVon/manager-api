import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialDescription } from '@prisma/client';
import { GetByIdFinancialDescriptionUseCase } from '../../usecases/get-by-id-financial-description.usecase';
import { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';

describe('GetByIdFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: GetByIdFinancialDescriptionUseCase;

  const id = 'record-1';
  const record = { id } as unknown as FinancialDescription;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new GetByIdFinancialDescriptionUseCase(repo);
  });

  it('should return the financial description', async () => {
    vi.mocked(repo.findById).mockResolvedValue(record);

    const result = await sut.execute(id);

    expect(repo.findById).toHaveBeenCalledWith(id);
    expect(result).toBe(record);
  });

  it('should throw NotFoundError when the financial description does not exist', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    await expect(sut.execute(id)).rejects.toMatchObject({ statusCode: 404 });
  });
});
