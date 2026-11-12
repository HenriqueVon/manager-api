import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinancialDescription } from '@prisma/client';
import { UpdateFinancialDescriptionUseCase } from '../../usecases/update-financial-description.usecase';
import { IFinancialDescriptionRepository } from '../../repositories/ifinancial-description.repository';

describe('UpdateFinancialDescriptionUseCase', () => {
  let repo: IFinancialDescriptionRepository;
  let sut: UpdateFinancialDescriptionUseCase;

  const id = 'record-1';

  const record = {
    id          : id,
    description : 'SUPERMARKET',
  } as unknown as FinancialDescription;

  beforeEach(() => {
    repo = {
      findByDescription : vi.fn(),
      update            : vi.fn(),
    } as unknown as IFinancialDescriptionRepository;

    sut = new UpdateFinancialDescriptionUseCase(repo);
  });

  it('should check description and update the financial description', async () => {
    vi.mocked(repo.findByDescription).mockResolvedValue(null);
    vi.mocked(repo.update).mockResolvedValue(record);

    const result = await sut.execute(id, { description: '  supermarket  ' });

    expect(repo.findByDescription).toHaveBeenCalledWith('SUPERMARKET');
    expect(repo.update).toHaveBeenCalledWith(id, { description: 'SUPERMARKET' });
    expect(result).toBe(record);
  });

  it('should allow the financial description to keep its description', async () => {
    vi.mocked(repo.findByDescription).mockResolvedValue(record);
    vi.mocked(repo.update).mockResolvedValue(record);

    await expect(sut.execute(id, { description: '  supermarket  ' })).resolves.toBe(record);
  });

  it('should throw ConflictError when description belongs to another financial description', async () => {
    vi.mocked(repo.findByDescription).mockResolvedValue({ ...record, id: 'other-record' });

    await expect(sut.execute(id, { description: '  supermarket  ' })).rejects.toMatchObject({
      statusCode : 409,
      message    : 'FinancialDescription description already exists!',
    });
    expect(repo.update).not.toHaveBeenCalled();
  });
});
