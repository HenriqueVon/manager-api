import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialEntryUseCase } from '../../usecases/create-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('CreateFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: CreateFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      create: vi.fn(),
    } as unknown as IFinancialEntryRepository;

    sut = new CreateFinancialEntryUseCase(repo);
  });

  it('should create a financial entry', async () => {
    const input = {
      type                   : 'PAYABLE',
      dueDate                : new Date('2026-08-10T00:00:00.000Z'),
      paymentDate            : null,
      amount                 : 100,
      amountPaid             : 0,
      additionalDescription  : 'MONTHLY INTERNET',
      isMonthly              : true,
      ledgerId               : 'ledger-1',
      financialDescriptionId : 'description-1',
      financialFundId        : 'fund-1',
      financialCategoryId    : 'category-1',
    } as any;

    const createdFinancialEntry = {
      id: 'entry-1',
      ...input,
    };

    (repo.create as any).mockResolvedValue(createdFinancialEntry);

    const result = await sut.execute(input);

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith(input);
    expect(result).toBe(createdFinancialEntry);
  });
});
