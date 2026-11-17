import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialEntryInstallmentsUseCase } from '../../usecases/create-financial-entry-installments.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('CreateFinancialEntryInstallmentsUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: CreateFinancialEntryInstallmentsUseCase;

  const baseInput = {
    type                   : 'PAYABLE',
    dueDate                : new Date('2026-11-05T00:00:00.000Z'),
    amount                 : 3000,
    installments           : 3,
    additionalDescription  : 'FLIGHT TICKET',
    ledgerId               : 'ledger-1',
    financialDescriptionId : 'description-1',
    financialFundId        : 'fund-1',
    financialCategoryId    : 'category-1',
  } as any;

  const createdEntries = async () => {
    await sut.execute(baseInput);
    return (repo.createMany as any).mock.calls[0][0] as any[];
  };

  beforeEach(() => {
    repo = {
      createMany: vi.fn().mockResolvedValue([]),
    } as unknown as IFinancialEntryRepository;

    sut = new CreateFinancialEntryInstallmentsUseCase(repo);
  });

  it('should create all the installments in one call and return them', async () => {
    const created = [{ id: 'entry-1' }, { id: 'entry-2' }, { id: 'entry-3' }];
    (repo.createMany as any).mockResolvedValue(created);

    const result = await sut.execute(baseInput);

    expect(repo.createMany).toHaveBeenCalledTimes(1);
    expect((repo.createMany as any).mock.calls[0][0]).toHaveLength(3);
    expect(result).toBe(created);
  });

  it('should create unpaid, non monthly entries that share the references of the input', async () => {
    const entries = await createdEntries();

    for (const entry of entries) {
      expect(entry).toMatchObject({
        type                   : 'PAYABLE',
        paymentDate            : null,
        amountPaid             : 0,
        isMonthly              : false,
        ledgerId               : 'ledger-1',
        financialDescriptionId : 'description-1',
        financialFundId        : 'fund-1',
        financialCategoryId    : 'category-1',
      });
      expect(entry).not.toHaveProperty('installments');
    }
  });

  it('should number the installments after the complement and give each one a month', async () => {
    const entries = await createdEntries();

    expect(entries.map((entry) => entry.additionalDescription)).toEqual([
      'FLIGHT TICKET 1/3',
      'FLIGHT TICKET 2/3',
      'FLIGHT TICKET 3/3',
    ]);
    expect(entries.map((entry) => entry.dueDate.toISOString())).toEqual([
      '2026-11-05T00:00:00.000Z',
      '2026-12-05T00:00:00.000Z',
      '2027-01-05T00:00:00.000Z',
    ]);
  });

  it('should use only the number when there is no complement', async () => {
    await sut.execute({ ...baseInput, additionalDescription: undefined });
    await sut.execute({ ...baseInput, additionalDescription: null });

    const [first, second] = (repo.createMany as any).mock.calls.map((call: any[]) => call[0][0]);
    expect(first.additionalDescription).toBe('1/3');
    expect(second.additionalDescription).toBe('1/3');
  });

  it('should give the cents left over to the last installment', async () => {
    await sut.execute({ ...baseInput, amount: 4000 });

    const entries = (repo.createMany as any).mock.calls[0][0] as any[];
    expect(entries.map((entry) => entry.amount)).toEqual([1333.33, 1333.33, 1333.34]);
  });

  it('should add up to the total in any split', async () => {
    for (const [amount, installments] of [[100, 7], [0.1, 3], [19.99, 12], [1000.01, 480]]) {
      (repo.createMany as any).mockClear();
      await sut.execute({ ...baseInput, amount, installments });

      const entries = (repo.createMany as any).mock.calls[0][0] as any[];
      const sumInCents = entries.reduce((sum, entry) => sum + Math.round(entry.amount * 100), 0);
      expect(entries).toHaveLength(installments);
      expect(sumInCents).toBe(Math.round(amount * 100));
    }
  });

  it('should keep the day of the first date, or the last day of a shorter month', async () => {
    await sut.execute({ ...baseInput, dueDate: new Date('2026-01-31T00:00:00.000Z'), installments: 4 });

    const entries = (repo.createMany as any).mock.calls[0][0] as any[];
    expect(entries.map((entry) => entry.dueDate.toISOString().slice(0, 10))).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });

  it('should handle a leap year and the change of year', async () => {
    await sut.execute({ ...baseInput, dueDate: new Date('2027-12-31T00:00:00.000Z'), installments: 3 });

    const entries = (repo.createMany as any).mock.calls[0][0] as any[];
    expect(entries.map((entry) => entry.dueDate.toISOString().slice(0, 10))).toEqual([
      '2027-12-31',
      '2028-01-31',
      '2028-02-29',
    ]);
  });
});
