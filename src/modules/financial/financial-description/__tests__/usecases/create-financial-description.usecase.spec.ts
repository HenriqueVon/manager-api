import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialDescriptionUseCase } from '../../usecases/create-financial-description.usecase';
import type { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';

describe('CreateFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: CreateFinancialDescriptionUseCase;

  beforeEach(() => {
    repo = {
      findByDescription : vi.fn(),
      create            : vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new CreateFinancialDescriptionUseCase(repo);
  });

  it('should trim + uppercase description, check uniqueness, then create', async () => {
    (repo.findByDescription as any).mockResolvedValue(null);

    const createdFinancialDescription = {
      id          : '1',
      description : 'SUPERMARKET',
    };

    (repo.create as any).mockResolvedValue(
      createdFinancialDescription
    );

    const input = {
      description: '  supermarket  ',
    } as any;

    const result = await sut.execute(input);

    expect(repo.findByDescription).toHaveBeenCalledTimes(1);
    expect(repo.findByDescription).toHaveBeenCalledWith(
      'SUPERMARKET'
    );

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      ...input,
      description: 'SUPERMARKET',
    });

    expect(result).toBe(createdFinancialDescription);
  });

  it('should throw ConflictError if description already exists', async () => {
    (repo.findByDescription as any).mockResolvedValue({
      id          : 'existing',
      description : 'SUPERMARKET',
    });

    const input = {
      description: ' supermarket ',
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
      message:
        'FinancialDescription description already exists!',
    });

    expect(repo.findByDescription).toHaveBeenCalledWith(
      'SUPERMARKET'
    );

    expect(repo.create).not.toHaveBeenCalled();
  });
});