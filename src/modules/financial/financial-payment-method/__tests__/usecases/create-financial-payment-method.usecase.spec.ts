import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialPaymentMethodUseCase } from '../../usecases/create-financial-payment-method.usecase';
import type { IFinancialPaymentMethodRepository } from '../../repositories/ifinancial-payment-method.repository';

describe('CreateFinancialPaymentMethodUseCase', () => {
  let repo: IFinancialPaymentMethodRepository;
  let sut: CreateFinancialPaymentMethodUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      create     : vi.fn(),
    } as unknown as IFinancialPaymentMethodRepository;

    sut = new CreateFinancialPaymentMethodUseCase(repo);
  });

  it('should trim + uppercase name, check uniqueness, then create', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const createdFinancialPaymentMethod = {
      id   : '1',
      name : 'CASH',
    };

    (repo.create as any).mockResolvedValue(
      createdFinancialPaymentMethod
    );

    const input = {
      name: '  cash  ',
    } as any;

    const result = await sut.execute(input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith(
      'CASH'
    );

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      ...input,
      name: 'CASH',
    });

    expect(result).toBe(createdFinancialPaymentMethod);
  });

  it('should throw ConflictError if name already exists', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'existing',
      name : 'CASH',
    });

    const input = {
      name: ' cash ',
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
      message:
        'FinancialPaymentMethod name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith(
      'CASH'
    );

    expect(repo.create).not.toHaveBeenCalled();
  });
});