import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteLedgerUseCase } from '../../usecases/delete-ledger.usecase';
import { ILedgerRepository } from '../../repositories/iledger.repository';

describe('DeleteLedgerUseCase', () => {
  let repo: ILedgerRepository;
  let sut: DeleteLedgerUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as ILedgerRepository;

    sut = new DeleteLedgerUseCase(repo);
  });

  it('should delete the ledger by id', async () => {
    vi.mocked(repo.delete).mockResolvedValue(undefined);

    await sut.execute('record-1');

    expect(repo.delete).toHaveBeenCalledWith('record-1');
  });
});
