import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Ledger } from '@prisma/client';
import { GetByIdLedgerUseCase } from '../../usecases/get-by-id-ledger.usecase';
import { ILedgerRepository } from '../../repositories/iledger.repository';

describe('GetByIdLedgerUseCase', () => {
  let repo: ILedgerRepository;
  let sut: GetByIdLedgerUseCase;

  const id = 'record-1';
  const record = { id } as unknown as Ledger;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as ILedgerRepository;

    sut = new GetByIdLedgerUseCase(repo);
  });

  it('should return the ledger', async () => {
    vi.mocked(repo.findById).mockResolvedValue(record);

    const result = await sut.execute(id);

    expect(repo.findById).toHaveBeenCalledWith(id);
    expect(result).toBe(record);
  });

  it('should throw NotFoundError when the ledger does not exist', async () => {
    vi.mocked(repo.findById).mockResolvedValue(null);

    await expect(sut.execute(id)).rejects.toMatchObject({ statusCode: 404 });
  });
});
