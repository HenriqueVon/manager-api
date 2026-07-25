import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListFinancialPaymentMethodUseCase } from '../../usecases/list-financial-payment-method.usecase';
import type { IFinancialPaymentMethodRepository } from '../../repositories/ifinancial-payment-method.repository';

describe('ListFinancialPaymentMethodUseCase', () => {
  let repo: IFinancialPaymentMethodRepository;
  let sut: ListFinancialPaymentMethodUseCase;

  beforeEach(() => {
    repo = {
      findMany: vi.fn(),
    } as unknown as IFinancialPaymentMethodRepository;

    sut = new ListFinancialPaymentMethodUseCase(repo);
  });

  it('should return paginated financial payment methods', async () => {
    const params = {
      limit          : 10,
      offset         : 0,
      orderBy        : 'name',
      orderDirection : 'asc' as const,
    };

    const paginatedResult = {
      data: [
        {
          id   : '1',
          name : 'PIX',
        },
        {
          id   : '2',
          name : 'CASH',
        },
      ],
      total  : 2,
      limit  : 10,
      offset : 0,
    };

    (repo.findMany as any).mockResolvedValue(paginatedResult);

    const result = await sut.execute(params);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith({}, params);

    expect(result).toBe(paginatedResult);
  });
});