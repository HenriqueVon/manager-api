import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialCategoryUseCase } from '../../usecases/update-financial-category.usecase';
import type { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';

describe('UpdateFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: UpdateFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      findMany : vi.fn(),
      update   : vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new UpdateFinancialCategoryUseCase(repo);
  });

  it('should update directly when name is undefined', async () => {
    const updatedFinancialCategory = {
      id               : 'category-1',
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : 'EXPENSES',
      type             : 'EXPENSE',
      balance          : 1500,
    };

    (repo.update as any).mockResolvedValue(updatedFinancialCategory);

    const input = {
      balance: 1500,
    } as any;

    const result = await sut.execute('category-1', input);

    expect(repo.findMany).not.toHaveBeenCalled();

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(
      'category-1',
      input
    );

    expect(result).toBe(updatedFinancialCategory);
  });

  it('should normalize name, check composite uniqueness, then update', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });

    const updatedFinancialCategory = {
      id               : 'category-1',
      ledgerId         : 'ledger-1',
      parentCategoryId : 'parent-category-1',
      name             : 'SUPERMARKET',
      type             : 'EXPENSE',
      balance          : 0,
    };

    (repo.update as any).mockResolvedValue(updatedFinancialCategory);

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : 'parent-category-1',
      name             : '  supermarket  ',
    } as any;

    const result = await sut.execute('category-1', input);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId         : 'ledger-1',
        parentCategoryId : 'parent-category-1',
        name             : 'SUPERMARKET',
      },
      {
        limit: 1,
      }
    );

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update).toHaveBeenCalledWith(
      'category-1',
      {
        ledgerId         : 'ledger-1',
        parentCategoryId : 'parent-category-1',
        name             : 'SUPERMARKET',
      }
    );

    expect(result).toBe(updatedFinancialCategory);
  });

  it('should allow update when matching category has the same id', async () => {
    (repo.findMany as any).mockResolvedValue({
      items: [
        {
          id               : 'category-1',
          ledgerId         : 'ledger-1',
          parentCategoryId : null,
          name             : 'EXPENSES',
          type             : 'EXPENSE',
          balance          : 0,
        },
      ],
      total: 1,
    });

    const updatedFinancialCategory = {
      id               : 'category-1',
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : 'EXPENSES',
      type             : 'EXPENSE',
      balance          : 0,
    };

    (repo.update as any).mockResolvedValue(updatedFinancialCategory);

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : ' expenses ',
    } as any;

    const result = await sut.execute('category-1', input);

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId         : 'ledger-1',
        parentCategoryId : null,
        name             : 'EXPENSES',
      },
      {
        limit: 1,
      }
    );

    expect(repo.update).toHaveBeenCalledWith(
      'category-1',
      {
        ledgerId         : 'ledger-1',
        parentCategoryId : null,
        name             : 'EXPENSES',
      }
    );

    expect(result).toBe(updatedFinancialCategory);
  });

  it('should throw ConflictError when matching category belongs to another id', async () => {
    (repo.findMany as any).mockResolvedValue({
      items: [
        {
          id               : 'another-category',
          ledgerId         : 'ledger-1',
          parentCategoryId : null,
          name             : 'EXPENSES',
          type             : 'EXPENSE',
          balance          : 0,
        },
      ],
      total: 1,
    });

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : ' expenses ',
    } as any;

    await expect(
      sut.execute('category-1', input)
    ).rejects.toMatchObject({
      message:
        'A financial category with the same name already exists in this ledger and parent category.',
    });

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId         : 'ledger-1',
        parentCategoryId : null,
        name             : 'EXPENSES',
      },
      {
        limit: 1,
      }
    );

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should allow changing parentCategoryId to null', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });

    const updatedFinancialCategory = {
      id               : 'category-1',
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : 'SUPERMARKET',
      type             : 'EXPENSE',
      balance          : 0,
    };

    (repo.update as any).mockResolvedValue(updatedFinancialCategory);

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : ' supermarket ',
    } as any;

    const result = await sut.execute('category-1', input);

    expect(repo.findMany).toHaveBeenCalledWith(
      {
        ledgerId         : 'ledger-1',
        parentCategoryId : null,
        name             : 'SUPERMARKET',
      },
      {
        limit: 1,
      }
    );

    expect(repo.update).toHaveBeenCalledWith(
      'category-1',
      {
        ledgerId         : 'ledger-1',
        parentCategoryId : null,
        name             : 'SUPERMARKET',
      }
    );

    expect(result).toBe(updatedFinancialCategory);
  });
});