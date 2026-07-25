import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialPaymentMethodUseCase } from '../../usecases/update-financial-payment-method.usecase';
import type { IFinancialPaymentMethodRepository } from '../../repositories/ifinancial-payment-method.repository';

describe('UpdateFinancialPaymentMethodUseCase', () => {
  let repo: IFinancialPaymentMethodRepository;
  let sut: UpdateFinancialPaymentMethodUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      update     : vi.fn(),
    } as unknown as IFinancialPaymentMethodRepository;

    sut = new UpdateFinancialPaymentMethodUseCase(repo);
  });

  it('should trim + uppercase name, check uniqueness, then update', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const updatedFinancialPaymentMethod = {
      id   : '1',
      name : 'PIX',
    };

    (repo.update as any).mockResolvedValue(
      updatedFinancialPaymentMethod
    );

    const input = {
      name: '  pix  ',
    } as any;

    const result = await sut.execute('1', input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith(
      'PIX'
    );

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('1', {
      name: 'PIX',
    });

    expect(result).toBe(updatedFinancialPaymentMethod);
  });

  it('should allow update when existing name belongs to the same id', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : '1',
      name : 'PIX',
    });

    const updatedFinancialPaymentMethod = {
      id   : '1',
      name : 'PIX',
    };

    (repo.update as any).mockResolvedValue(
      updatedFinancialPaymentMethod
    );

    const result = await sut.execute('1', {
      name: ' pix ',
    } as any);

    expect(repo.findByName).toHaveBeenCalledWith(
      'PIX'
    );

    expect(repo.update).toHaveBeenCalledWith('1', {
      name: 'PIX',
    });

    expect(result).toBe(updatedFinancialPaymentMethod);
  });

  it('should throw ConflictError if name belongs to another id', async () => {
    (repo.findByName as any).mockResolvedValue({
      id   : 'another-id',
      name : 'PIX',
    });

    await expect(
      sut.execute('1', {
        name: ' pix ',
      } as any)
    ).rejects.toMatchObject({
      message:
        'FinancialPaymentMethod name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith(
      'PIX'
    );

    expect(repo.update).not.toHaveBeenCalled();
  });
});