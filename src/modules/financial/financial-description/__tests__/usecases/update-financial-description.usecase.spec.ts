import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialDescriptionUseCase } from '../../usecases/update-financial-description.usecase';
import type { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';

describe('UpdateFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: UpdateFinancialDescriptionUseCase;

  beforeEach(() => {
    repo = {
      findByDescription : vi.fn(),
      update            : vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new UpdateFinancialDescriptionUseCase(repo);
  });

  it('should trim + uppercase description, check uniqueness, then update', async () => {
    (repo.findByDescription as any).mockResolvedValue(null);

    const updatedFinancialDescription = {
      id          : '1',
      description : 'ELECTRICITY',
    };

    (repo.update as any).mockResolvedValue(
      updatedFinancialDescription
    );

    const input = {
      description: '  electricity  ',
    } as any;

    const result = await sut.execute('1', input);

    expect(repo.findByDescription).toHaveBeenCalledTimes(1);
    expect(repo.findByDescription).toHaveBeenCalledWith(
      'ELECTRICITY'
    );

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('1', {
      description: 'ELECTRICITY',
    });

    expect(result).toBe(updatedFinancialDescription);
  });

  it('should allow update when existing description belongs to the same id', async () => {
    (repo.findByDescription as any).mockResolvedValue({
      id          : '1',
      description : 'ELECTRICITY',
    });

    const updatedFinancialDescription = {
      id          : '1',
      description : 'ELECTRICITY',
    };

    (repo.update as any).mockResolvedValue(
      updatedFinancialDescription
    );

    const result = await sut.execute('1', {
      description: ' electricity ',
    } as any);

    expect(repo.findByDescription).toHaveBeenCalledWith(
      'ELECTRICITY'
    );

    expect(repo.update).toHaveBeenCalledWith('1', {
      description: 'ELECTRICITY',
    });

    expect(result).toBe(updatedFinancialDescription);
  });

  it('should throw ConflictError if description belongs to another id', async () => {
    (repo.findByDescription as any).mockResolvedValue({
      id          : 'another-id',
      description : 'ELECTRICITY',
    });

    await expect(
      sut.execute('1', {
        description: ' electricity ',
      } as any)
    ).rejects.toMatchObject({
      message:
        'FinancialDescription description already exists!',
    });

    expect(repo.findByDescription).toHaveBeenCalledWith(
      'ELECTRICITY'
    );

    expect(repo.update).not.toHaveBeenCalled();
  });
});