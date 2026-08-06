import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialEntryUseCase } from '../../usecases/update-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('UpdateFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: UpdateFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      update: vi.fn(),
    } as unknown as IFinancialEntryRepository;

    sut = new UpdateFinancialEntryUseCase(repo);
  });

  it('should update a financial entry', async () => {
    const input = {
      paymentDate : new Date('2026-08-12T00:00:00.000Z'),
      amountPaid  : 100,
    } as any;

    const updatedFinancialEntry = {
      id                     : 'entry-1',
      type                   : 'PAYABLE',
      dueDate                : new Date('2026-08-10T00:00:00.000Z'),
      paymentDate            : input.paymentDate,
      amount                 : 100,
      amountPaid             : 100,
      additionalDescription  : 'MONTHLY INTERNET',
      isMonthly              : true,
      ledgerId               : 'ledger-1',
      financialDescriptionId : 'description-1',
      financialFundId        : 'fund-1',
      financialCategoryId    : 'category-1',
    };

    (repo.update as any).mockResolvedValue(updatedFinancialEntry);

    const result = await sut.execute('entry-1', input);

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith('entry-1', input);
    expect(result).toBe(updatedFinancialEntry);
  });

  it('should allow setting paymentDate to null', async () => {
    const input = { paymentDate: null } as any;
    const updatedFinancialEntry = { id: 'entry-1', paymentDate: null };

    (repo.update as any).mockResolvedValue(updatedFinancialEntry);

    const result = await sut.execute('entry-1', input);

    expect(repo.update).toHaveBeenCalledWith('entry-1', {
      paymentDate: null,
    });
    expect(result).toBe(updatedFinancialEntry);
  });
});
