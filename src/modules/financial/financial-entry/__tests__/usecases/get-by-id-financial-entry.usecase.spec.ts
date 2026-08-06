import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetByIdFinancialEntryUseCase } from '../../usecases/get-by-id-financial-entry.usecase';
import type { IFinancialEntryRepository } from '../../repositories/ifinancial-entry.repository';
import { NotFoundError } from '@shared/errors/app-error';

describe('GetByIdFinancialEntryUseCase', () => {
  let repo: IFinancialEntryRepository;
  let sut: GetByIdFinancialEntryUseCase;

  beforeEach(() => {
    repo = {
      findById: vi.fn(),
    } as unknown as IFinancialEntryRepository;

    sut = new GetByIdFinancialEntryUseCase(repo);
  });

  it('should return financial entry when it exists', async () => {
    const financialEntry = {
      id                     : 'entry-1',
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
    };

    (repo.findById as any).mockResolvedValue(financialEntry);

    const result = await sut.execute('entry-1');

    expect(repo.findById).toHaveBeenCalledTimes(1);
    expect(repo.findById).toHaveBeenCalledWith('entry-1');
    expect(result).toBe(financialEntry);
  });

  it('should throw NotFoundError when financial entry does not exist', async () => {
    (repo.findById as any).mockResolvedValue(null);

    await expect(
      sut.execute('entry-1')
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(repo.findById).toHaveBeenCalledWith('entry-1');
  });
});
