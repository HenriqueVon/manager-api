import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialBankAccountUseCase } from '../../usecases/delete-financial-bank-account.usecase';
import type { IFinancialBankAccountRepository } from '../../repositories/ifinancial-bank-account.repository';

describe('DeleteFinancialBankAccountUseCase', () => {
  let repo: IFinancialBankAccountRepository;
  let sut: DeleteFinancialBankAccountUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialBankAccountRepository;

    sut = new DeleteFinancialBankAccountUseCase(repo);
  });

  it('should delete financial bank account by id', async () => {
    (repo.delete as any).mockResolvedValue(undefined);

    const result = await sut.execute('account-1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('account-1');
    expect(result).toBeUndefined();
  });
});
