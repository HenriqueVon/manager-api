import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateFinancialCurrencyUseCase } from '../../usecases/create-financial-currency.usecase';
import type { IFinancialCurrencyRepository } from '../../repositories/ifinancial-currency.repository';

describe('CreateFinancialCurrencyUseCase', () => {
  let repo: IFinancialCurrencyRepository;
  let sut: CreateFinancialCurrencyUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      create     : vi.fn(),
    } as unknown as IFinancialCurrencyRepository;

    sut = new CreateFinancialCurrencyUseCase(repo);
  });

  it('should trim + uppercase name, check uniqueness, then create', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const createdCurrency = {
      id     : '1',
      name   : 'EURO',
      symbol : 'EUR',
    };

    (repo.create as any).mockResolvedValue(createdCurrency);

    const input = {
      name   : '  euro  ',
      symbol : 'EUR',
    } as any;

    const result = await sut.execute(input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith('EURO');

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({
      ...input,
      name: 'EURO',
    });

    expect(result).toBe(createdCurrency);
  });

  it('should throw ConflictError if name already exists', async () => {
    (repo.findByName as any).mockResolvedValue({
      id     : 'existing',
      name   : 'EURO',
      symbol : 'EUR',
    });

    await expect(
      sut.execute({ name: ' euro ', symbol: 'EUR' } as any)
    ).rejects.toMatchObject({
      message: 'FinancialCurrency name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('EURO');
    expect(repo.create).not.toHaveBeenCalled();
  });
});