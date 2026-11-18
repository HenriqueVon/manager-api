import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SummaryByMonthFinancialEntryUseCase } from '../../usecases/summary-by-month-financial-entry.usecase';
import { SummaryByCategoryFinancialEntryUseCase } from '../../usecases/summary-by-category-financial-entry.usecase';
import { AgingFinancialEntryUseCase } from '../../usecases/aging-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';

describe('Summary breakdown use cases', () => {
  let repo: IFinancialEntryRepository;

  beforeEach(() => {
    repo = {
      summarizeByMonth    : vi.fn().mockResolvedValue([]),
      summarizeByCategory : vi.fn().mockResolvedValue([]),
      summarizeAging      : vi.fn().mockResolvedValue([]),
    } as unknown as IFinancialEntryRepository;
  });

  describe('SummaryByMonthFinancialEntryUseCase', () => {
    it('should pass the filters apart from the date range and return the items', async () => {
      const groups = [{ month: '2026-11' }];
      (repo.summarizeByMonth as any).mockResolvedValue(groups);
      const dueDateFrom = new Date('2026-01-01T00:00:00.000Z');
      const dueDateTo = new Date('2026-12-31T00:00:00.000Z');

      const result = await new SummaryByMonthFinancialEntryUseCase(repo).execute({ ledgerId: 'ledger-1', paid: false, dueDateFrom, dueDateTo });

      expect(repo.summarizeByMonth).toHaveBeenCalledWith({ ledgerId: 'ledger-1', paid: false }, { from: dueDateFrom, to: dueDateTo });
      expect(result).toEqual({ items: groups });
    });

    it('should work with no filters', async () => {
      await new SummaryByMonthFinancialEntryUseCase(repo).execute();

      expect(repo.summarizeByMonth).toHaveBeenCalledWith({}, { from: undefined, to: undefined });
    });
  });

  describe('SummaryByCategoryFinancialEntryUseCase', () => {
    it('should pass the filters apart from the date range and return the items', async () => {
      const groups = [{ financialCategoryId: 'category-1' }];
      (repo.summarizeByCategory as any).mockResolvedValue(groups);

      const result = await new SummaryByCategoryFinancialEntryUseCase(repo).execute({ type: 'PAYABLE' });

      expect(repo.summarizeByCategory).toHaveBeenCalledWith({ type: 'PAYABLE' }, { from: undefined, to: undefined });
      expect(result).toEqual({ items: groups });
    });
  });

  describe('AgingFinancialEntryUseCase', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-11-17T15:42:10.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should count from the current UTC date, at midnight', async () => {
      const groups = [{ band: 'OVERDUE' }];
      (repo.summarizeAging as any).mockResolvedValue(groups);

      const result = await new AgingFinancialEntryUseCase(repo).execute({ ledgerId: 'ledger-1', type: 'PAYABLE' });

      expect(repo.summarizeAging).toHaveBeenCalledWith({ ledgerId: 'ledger-1', type: 'PAYABLE' }, new Date('2026-11-17T00:00:00.000Z'));
      expect(result).toEqual({ items: groups });
    });
  });
});
