import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteFinancialPaymentMethodUseCase } from '../../usecases/delete-financial-payment-method.usecase';
import type { IFinancialPaymentMethodRepository } from '../../repositories/ifinancial-payment-method.repository';

describe('DeleteFinancialPaymentMethodUseCase', () => {
  let repo: IFinancialPaymentMethodRepository;
  let sut: DeleteFinancialPaymentMethodUseCase;

  beforeEach(() => {
    repo = {
      delete: vi.fn(),
    } as unknown as IFinancialPaymentMethodRepository;

    sut = new DeleteFinancialPaymentMethodUseCase(repo);
  });

  it('should delete financial name by id', async () => {
    (repo.delete as any).mockResolvedValue(undefined);

    const result = await sut.execute('1');

    expect(repo.delete).toHaveBeenCalledTimes(1);
    expect(repo.delete).toHaveBeenCalledWith('1');

    expect(result).toBeUndefined();
  });
});