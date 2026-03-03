import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateLedgerUseCase } from './../../usecases';
import type { ILedgerRepository } from '../../repositories/iledger.repository';

describe('UpdateLedgerUseCase', () => {
  let repo: ILedgerRepository;
  let sut: UpdateLedgerUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      update     : vi.fn(),
    } as unknown as ILedgerRepository;

    sut = new UpdateLedgerUseCase(repo);
  });

  it('should update directly when name is undefined (no findByName)', async () => {
    const updatedLedger = { id: '1', name: 'EUROPE', type: 'FIAT' };
    (repo.update as any).mockResolvedValue(updatedLedger);

    const input = { type: 'CRYPTO' } as any;

    const result = await sut.execute('1', input);

    expect(repo.findByName).not.toHaveBeenCalled();

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('1', input);

    expect(result).toBe(updatedLedger);
  });

  it('should trim + uppercase name, check uniqueness, then update with normalized name', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const updatedLedger = { id: '1', name: 'AFRICA', type: 'FIAT' };
    (repo.update as any).mockResolvedValue(updatedLedger);

    const input = { name: '  africa  ' } as any;

    const result = await sut.execute('1', input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith('AFRICA');

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('1', { name: 'AFRICA' });

    expect(result).toBe(updatedLedger);
  });

  it('should throw ConflictError if name already exists for another ledger', async () => {
    (repo.findByName as any).mockResolvedValue({ id: 'other', name: 'AFRICA' });

    await expect(sut.execute('1', { name: ' africa ' } as any)).rejects.toMatchObject({
      message: 'Ledger name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('AFRICA');
    expect(repo.update).not.toHaveBeenCalled();
  });
});