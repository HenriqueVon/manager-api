import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialFundUseCase } from '../../usecases/delete-financial-fund.usecase';
import type { IFinancialFundRepository } from '../../repositories/ifinancial-fund.repository';

describe('DeleteFinancialFundUseCase', () => {
  let repo: IFinancialFundRepository;
  let sut: DeleteFinancialFundUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialFundRepository;

    sut = new DeleteFinancialFundUseCase(repo);
  });

  it('should delete financial fund by id', async () => {
    (repo.delete as any).mockResolvedValue(undefined);

    const result = await sut.execute('fund-1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('fund-1');
    expect(result).toBeUndefined();
  });
});
