import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Ledger } from '@prisma/client';
import { CreateLedgerUseCase } from '../../usecases/create-ledger.usecase';
import { ILedgerRepository } from '../../repositories/iledger.repository';
import { CreateLedgerDto } from '../../dtos';

describe('CreateLedgerUseCase', () => {
  let repo: ILedgerRepository;
  let sut: CreateLedgerUseCase;

  const input: CreateLedgerDto = {
    name : '  europe  ',
    type : 'FIAT',
  };

  const record = {
    id   : 'record-1',
    name : 'EUROPE',
    type : 'FIAT',
  } as unknown as Ledger;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      create     : vi.fn(),
    } as unknown as ILedgerRepository;

    sut = new CreateLedgerUseCase(repo);
  });

  it('should check name and create the ledger', async () => {
    vi.mocked(repo.findByName).mockResolvedValue(null);
    vi.mocked(repo.create).mockResolvedValue(record);

    const result = await sut.execute(input);

    expect(repo.findByName).toHaveBeenCalledWith('EUROPE');
    expect(repo.create).toHaveBeenCalledWith({ ...input, name: 'EUROPE' });
    expect(result).toBe(record);
  });

  it('should throw ConflictError when name already exists', async () => {
    vi.mocked(repo.findByName).mockResolvedValue(record);

    await expect(sut.execute(input)).rejects.toMatchObject({
      statusCode : 409,
      message    : 'Ledger name already exists!',
    });
    expect(repo.create).not.toHaveBeenCalled();
  });
});
