import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateFinancialCurrencyUseCase } from '../../usecases/update-financial-currency.usecase';
import type { IFinancialCurrencyRepository } from '../../repositories/ifinancial-currency.repository';

describe('UpdateFinancialCurrencyUseCase', () => {
  let repo: IFinancialCurrencyRepository;
  let sut: UpdateFinancialCurrencyUseCase;

  beforeEach(() => {
    repo = {
      findByName : vi.fn(),
      update     : vi.fn(),
    } as unknown as IFinancialCurrencyRepository;

    sut = new UpdateFinancialCurrencyUseCase(repo);
  });

  it('should update directly when name is undefined', async () => {
    const updatedCurrency = {
      id     : '1',
      name   : 'EURO',
      symbol : '€',
    };

    (repo.update as any).mockResolvedValue(updatedCurrency);

    const input = { symbol: '€' } as any;

    const result = await sut.execute('1', input);

    expect(repo.findByName).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('1', input);
    expect(result).toBe(updatedCurrency);
  });

  it('should trim + uppercase name, check uniqueness, then update', async () => {
    (repo.findByName as any).mockResolvedValue(null);

    const updatedCurrency = {
      id     : '1',
      name   : 'DOLLAR',
      symbol : 'USD',
    };

    (repo.update as any).mockResolvedValue(updatedCurrency);

    const input = {
      name   : '  dollar  ',
      symbol : 'USD',
    } as any;

    const result = await sut.execute('1', input);

    expect(repo.findByName).toHaveBeenCalledTimes(1);
    expect(repo.findByName).toHaveBeenCalledWith('DOLLAR');

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('1', {
      name   : 'DOLLAR',
      symbol : 'USD',
    });

    expect(result).toBe(updatedCurrency);
  });

  it('should allow update when existing currency has same id', async () => {
    (repo.findByName as any).mockResolvedValue({
      id     : '1',
      name   : 'EURO',
      symbol : 'EUR',
    });

    const updatedCurrency = {
      id     : '1',
      name   : 'EURO',
      symbol : '€',
    };

    (repo.update as any).mockResolvedValue(updatedCurrency);

    const result = await sut.execute('1', {
      name   : ' euro ',
      symbol : '€',
    } as any);

    expect(repo.findByName).toHaveBeenCalledWith('EURO');
    expect(repo.update).toHaveBeenCalledWith('1', {
      name   : 'EURO',
      symbol : '€',
    });
    expect(result).toBe(updatedCurrency);
  });

  it('should throw ConflictError if name already exists for another currency', async () => {
    (repo.findByName as any).mockResolvedValue({
      id     : 'other',
      name   : 'EURO',
      symbol : 'EUR',
    });

    await expect(
      sut.execute('1', { name: ' euro ' } as any)
    ).rejects.toMatchObject({
      message: 'FinancialCurrency name already exists!',
    });

    expect(repo.findByName).toHaveBeenCalledWith('EURO');
    expect(repo.update).not.toHaveBeenCalled();
  });
});