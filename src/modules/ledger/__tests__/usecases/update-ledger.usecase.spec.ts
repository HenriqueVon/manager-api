import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Ledger } from '@prisma/client';
import { UpdateLedgerUseCase } from '../../usecases/update-ledger.usecase';
import { ILedgerRepository } from '../../repositories/iledger.repository';
import { UpdateLedgerDto } from '../../dtos';

describe('UpdateLedgerUseCase', () => {
  let repo: ILedgerRepository;
  let sut: UpdateLedgerUseCase;

  const id = 'record-1';

  const record = {
    id   : id,
    name : 'EUROPE',
    type : 'FIAT',
  } as unknown as Ledger;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      update     : vi.fn(),
    } as unknown as ILedgerRepository;

    sut = new UpdateLedgerUseCase(repo);
  });

  it('should update only the provided fields', async () => {
    vi.mocked(repo.update).mockResolvedValue(record);

    const input: UpdateLedgerDto = { type: 'FIAT' };

    const result = await sut.execute(id, input);

    expect(repo.findByName).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledWith(id, input);
    expect(result).toBe(record);
  });

  it('should check name and update the ledger', async () => {
    vi.mocked(repo.findByName).mockResolvedValue(null);
    vi.mocked(repo.update).mockResolvedValue(record);

    const result = await sut.execute(id, { name: '  europe  ' });

    expect(repo.findByName).toHaveBeenCalledWith('EUROPE');
    expect(repo.update).toHaveBeenCalledWith(id, { name: 'EUROPE' });
    expect(result).toBe(record);
  });

  it('should allow the ledger to keep its name', async () => {
    vi.mocked(repo.findByName).mockResolvedValue(record);
    vi.mocked(repo.update).mockResolvedValue(record);

    await expect(sut.execute(id, { name: '  europe  ' })).resolves.toBe(record);
  });

  it('should throw ConflictError when name belongs to another ledger', async () => {
    vi.mocked(repo.findByName).mockResolvedValue({ ...record, id: 'other-record' });

    await expect(sut.execute(id, { name: '  europe  ' })).rejects.toMatchObject({
      statusCode : 409,
      message    : 'Ledger name already exists!',
    });
    expect(repo.update).not.toHaveBeenCalled();
  });
});
