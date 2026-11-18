import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialEntryMonthlyUseCase } from '../../usecases/create-financial-entry-monthly.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('CreateFinancialEntryMonthlyUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: CreateFinancialEntryMonthlyUseCase;

  const baseInput = {
    type                   : 'PAYABLE',
    dueDate                : new Date('2026-11-05T00:00:00.000Z'),
    amount                 : 120.5,
    repeatCount            : 3,
    additionalDescription  : 'INTERNET',
    ledgerId               : 'ledger-1',
    financialDescriptionId : 'description-1',
    financialFundId        : 'fund-1',
    financialCategoryId    : 'category-1',
  } as any;

  const createdEntries = async (input = baseInput) => {
    await sut.execute(input);
    return (repo.createMany as any).mock.calls[0][0] as any[];
  };

  beforeEach(() => {
    repo = {
      createMany: vi.fn().mockResolvedValue([]),
    } as unknown as IFinancialEntryRepository;

    sut = new CreateFinancialEntryMonthlyUseCase(repo);
  });

  it('should create all the entries in one call and return them', async () => {
    const created = [{ id: 'entry-1' }, { id: 'entry-2' }, { id: 'entry-3' }];
    (repo.createMany as any).mockResolvedValue(created);

    const result = await sut.execute(baseInput);

    expect(repo.createMany).toHaveBeenCalledTimes(1);
    expect((repo.createMany as any).mock.calls[0][0]).toHaveLength(3);
    expect(result).toBe(created);
  });

  it('should repeat the full amount and the description in every entry, unpaid and monthly', async () => {
    const entries = await createdEntries();

    for (const entry of entries) {
      expect(entry).toMatchObject({
        type                   : 'PAYABLE',
        amount                 : 120.5,
        additionalDescription  : 'INTERNET',
        paymentDate            : null,
        amountPaid             : 0,
        isMonthly              : true,
        ledgerId               : 'ledger-1',
        financialDescriptionId : 'description-1',
        financialFundId        : 'fund-1',
        financialCategoryId    : 'category-1',
      });
      expect(entry).not.toHaveProperty('repeatCount');
    }
  });

  it('should give each entry the next month', async () => {
    const entries = await createdEntries();

    expect(entries.map((entry) => entry.dueDate.toISOString())).toEqual([
      '2026-11-05T00:00:00.000Z',
      '2026-12-05T00:00:00.000Z',
      '2027-01-05T00:00:00.000Z',
    ]);
  });

  it('should keep the day of the first date, or the last day of a shorter month', async () => {
    const entries = await createdEntries({ ...baseInput, dueDate: new Date('2027-12-31T00:00:00.000Z'), repeatCount: 4 });

    expect(entries.map((entry) => entry.dueDate.toISOString().slice(0, 10))).toEqual([
      '2027-12-31',
      '2028-01-31',
      '2028-02-29',
      '2028-03-31',
    ]);
  });

  it('should keep a missing description as it is', async () => {
    const entries = await createdEntries({ ...baseInput, additionalDescription: null });

    expect(entries.every((entry) => entry.additionalDescription === null)).toBe(true);
  });
});
