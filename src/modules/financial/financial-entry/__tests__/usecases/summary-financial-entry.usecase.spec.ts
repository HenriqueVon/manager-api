import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { SummaryFinancialEntryUseCase } from '../../usecases/summary-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('SummaryFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: SummaryFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      summarize: vi.fn(),
    } as unknown as IFinancialEntryRepository;

    sut = new SummaryFinancialEntryUseCase(repo);
  });

  it('should return the groups of the repository', async () => {
    const groups = [
      { type: 'PAYABLE', financialCurrencyId: 'currency-1', count: 2, amount: new Prisma.Decimal(150), amountPaid: new Prisma.Decimal(50) },
    ];
    (repo.summarize as any).mockResolvedValue(groups);

    const result = await sut.execute();

    expect(repo.summarize).toHaveBeenCalledWith({}, { from: undefined, to: undefined });
    expect(result).toEqual({ items: groups });
  });

  it('should pass the ledger, the type and the ids apart from the date range', async () => {
    (repo.summarize as any).mockResolvedValue([]);
    const dueDateFrom = new Date('2026-11-01T00:00:00.000Z');
    const dueDateTo = new Date('2026-11-30T00:00:00.000Z');

    const result = await sut.execute({ ledgerId: 'ledger-1', type: 'PAYABLE', ids: ['a', 'b'], dueDateFrom, dueDateTo });

    expect(repo.summarize).toHaveBeenCalledWith({ ledgerId: 'ledger-1', type: 'PAYABLE', ids: ['a', 'b'] }, { from: dueDateFrom, to: dueDateTo });
    expect(result).toEqual({ items: [] });
  });
});
