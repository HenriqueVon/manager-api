import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFinancialCategoryUseCase } from '../../usecases/create-financial-category.usecase';
import type { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';

describe('CreateFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: CreateFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      findById : vi.fn(),
      findMany : vi.fn(),
      create   : vi.fn(),
    } as unknown as IFinancialCategoryRepository;

    sut = new CreateFinancialCategoryUseCase(repo);
  });

  it('should check composite uniqueness and create a root category', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });

    const createdFinancialCategory = {
      id               : 'category-1',
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : 'EXPENSES',
      type             : 'EXPENSE',
      balance          : 0,
    };

    (repo.create as any).mockResolvedValue(createdFinancialCategory);

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : null,
      name             : '  expenses  ',
      type             : 'EXPENSE',
      balance          : 0,
    } as any;

    const result = await sut.execute(input);

    expect(repo.findMany).toHaveBeenCalledTimes(1);
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

    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create).toHaveBeenCalledWith({ ...input, name: 'EXPENSES' });

    expect(result).toBe(createdFinancialCategory);
  });

  it('should check composite uniqueness and create a child category', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });
    (repo.findById as any).mockResolvedValue({ id: 'parent-category-1', type: 'EXPENSE' });

    const createdFinancialCategory = {
      id               : 'category-2',
      ledgerId         : 'ledger-1',
      parentCategoryId : 'parent-category-1',
      name             : 'SUPERMARKET',
      type             : 'EXPENSE',
      balance          : 0,
    };

    (repo.create as any).mockResolvedValue(createdFinancialCategory);

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : 'parent-category-1',
      name             : ' supermarket ',
      type             : 'EXPENSE',
      balance          : 0,
    } as any;

    const result = await sut.execute(input);

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

    expect(repo.create).toHaveBeenCalledWith({ ...input, name: 'SUPERMARKET' });
    expect(result).toBe(createdFinancialCategory);
  });

  it('should throw ConflictError when category already exists in the same ledger and parent', async () => {
    (repo.findMany as any).mockResolvedValue({
      items: [
        {
          id               : 'existing-category',
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
      type             : 'EXPENSE',
      balance          : 0,
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
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

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictError when the parent has another type', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });
    (repo.findById as any).mockResolvedValue({ id: 'parent-category-1', type: 'INCOME' });

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : 'parent-category-1',
      name             : 'SUPERMARKET',
      type             : 'EXPENSE',
      balance          : 0,
    } as any;

    await expect(sut.execute(input)).rejects.toMatchObject({
      message: 'A financial category must have the same type as its parent category.',
    });

    expect(repo.findById).toHaveBeenCalledWith('parent-category-1');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('should leave a missing parent to the foreign key', async () => {
    (repo.findMany as any).mockResolvedValue({
      items : [],
      total : 0,
    });
    (repo.findById as any).mockResolvedValue(null);
    (repo.create as any).mockResolvedValue({ id: 'category-2' });

    const input = {
      ledgerId         : 'ledger-1',
      parentCategoryId : 'missing-parent',
      name             : 'SUPERMARKET',
      type             : 'EXPENSE',
      balance          : 0,
    } as any;

    await sut.execute(input);

    expect(repo.create).toHaveBeenCalledWith(input);
  });
});
