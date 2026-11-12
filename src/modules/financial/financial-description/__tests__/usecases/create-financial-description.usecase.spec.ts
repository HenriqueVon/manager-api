import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialDescription } from '@prisma/client';
import { CreateFinancialDescriptionUseCase } from '../../usecases/create-financial-description.usecase';
import { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';
import { CreateFinancialDescriptionDto } from '../../dtos';

describe('CreateFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: CreateFinancialDescriptionUseCase;

  const input: CreateFinancialDescriptionDto = {
    description: '  supermarket  ',
  };

  const record = {
    id          : 'record-1',
    description : 'SUPERMARKET',
  } as unknown as FinancialDescription;

  beforeEach(() => {
    repo = {
      findByDescription : vi.fn(),
      create            : vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new CreateFinancialDescriptionUseCase(repo);
  });

  it('should check description and create the financial description', async () => {
    vi.mocked(repo.findByDescription).mockResolvedValue(null);
    vi.mocked(repo.create).mockResolvedValue(record);

    const result = await sut.execute(input);

    expect(repo.findByDescription).toHaveBeenCalledWith('SUPERMARKET');
    expect(repo.create).toHaveBeenCalledWith({ ...input, description: 'SUPERMARKET' });
    expect(result).toBe(record);
  });

  it('should throw ConflictError when description already exists', async () => {
    vi.mocked(repo.findByDescription).mockResolvedValue(record);

    await expect(sut.execute(input)).rejects.toMatchObject({
      statusCode : 409,
      message    : 'FinancialDescription description already exists!',
    });
    expect(repo.create).not.toHaveBeenCalled();
  });
});
