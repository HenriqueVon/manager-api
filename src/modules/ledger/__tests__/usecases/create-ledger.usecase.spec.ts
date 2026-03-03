import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateLedgerUseCase } from './../../usecases';
import type { ILedgerRepository } from '../../repositories/iledger.repository';

describe('CreateLedgerUseCase', () => {
  let repo: ILedgerRepository;
  let sut: CreateLedgerUseCase;


  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      create     : vi.fn(),      
    } as unknown as ILedgerRepository;

    sut = new CreateLedgerUseCase(repo);
  });

  it('should trim + uppercase name, check uniqueness, then create', async () =>{
    (repo.findByName as any).mockResolvedValue(null);

    const createdLedger  = { id: '1', name: 'EUROPE', type: 'FIAT'} ;
    (repo.create as any).mockResolvedValue(createdLedger);

    const input = { name: '  europe  ' } as any;

    const result = await sut.execute(input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith('EUROPE');

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({ ...input, name: 'EUROPE' });

    expect(result).toBe(createdLedger);
  });

  it('should throw ConflictError if name already exists', async () => {
    (repo.findByName as any).mockResolvedValue({ id: 'existing', name: 'EUROPE' });

    await expect(sut.execute({ name: ' europe ' } as any)).rejects.toMatchObject({
      message: 'Ledger name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('EUROPE');
    expect(repo.create).not.toHaveBeenCalled();
  });
});
