import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetByIdFinancialPaymentMethodUseCase } from '../../usecases/get-by-id-financial-payment-method.usecase';
import type { IFinancialPaymentMethodRepository } from '../../repositories/ifinancial-payment-method.repository';
import { NotFoundError } from '@shared/errors/app-error';

describe('GetByIdFinancialPaymentMethodUseCase', () => {
  let repo: IFinancialPaymentMethodRepository;
  let sut: GetByIdFinancialPaymentMethodUseCase;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialPaymentMethodRepository;

    sut = new GetByIdFinancialPaymentMethodUseCase(repo);
  });

  it('should return financial name when it exists', async () => {
    const financialPaymentMethod = {
      id   : '1',
      name : 'CASH',
    };

    (repo.findById as any).mockResolvedValue(
      financialPaymentMethod
    );

    const result = await sut.execute('1');

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('1');

    expect(result).toBe(financialPaymentMethod);
  });

  it('should throw NotFoundError when financial name does not exist', async () => {
    (repo.findById as any).mockResolvedValue(null);

    await expect(sut.execute('1')).rejects.toBeInstanceOf(
      NotFoundError
    );

    expect(repo.findById).toHaveBeenCalledWith('1');
  });
});