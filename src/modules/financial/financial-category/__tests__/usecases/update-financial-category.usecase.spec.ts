import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFinancialCategoryUseCase } from '../../usecases/update-financial-category.usecase';
import type { IFinancialCategoryRepository } from '../../repositories/ifinancial-category.repository';

describe('UpdateFinancialCategoryUseCase', () => {
  let repo: IFinancialCategoryRepository;
  let sut: UpdateFinancialCategoryUseCase;

  beforeEach(() => {
    repo = {
      findById : vi.fn(),
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

  describe('category hierarchy', () => {
    const category = (id: string, parentCategoryId: string | null, type = 'EXPENSE') => ({
      id,
      ledgerId : 'ledger-1',
      parentCategoryId,
      name     : id.toUpperCase(),
      type,
      balance  : 0,
    });

    // findById answers from a fake table of categories
    const givenCategories = (...categories: ReturnType<typeof category>[]) => {
      (repo.findById as any).mockImplementation(async (id: string) =>
        categories.find((item) => item.id === id) ?? null
      );
    };

    const givenNoChildren = () => {
      (repo.findMany as any).mockResolvedValue({ items: [], total: 0 });
    };

    it('should throw ConflictError when the category is set as its own parent', async () => {
      givenCategories(category('category-1', null));

      await expect(
        sut.execute('category-1', { parentCategoryId: 'category-1' })
      ).rejects.toMatchObject({
        message: 'A financial category cannot be its own parent.',
      });

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when the new parent is a direct child (A -> B -> A)', async () => {
      givenCategories(
        category('category-a', null),
        category('category-b', 'category-a')
      );

      await expect(
        sut.execute('category-a', { parentCategoryId: 'category-b' })
      ).rejects.toMatchObject({
        message: 'Moving the category under this parent would create a cycle in the category hierarchy.',
      });

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when the new parent is a deeper descendant (A -> B -> C -> A)', async () => {
      givenCategories(
        category('category-a', null),
        category('category-b', 'category-a'),
        category('category-c', 'category-b')
      );

      await expect(
        sut.execute('category-a', { parentCategoryId: 'category-c' })
      ).rejects.toMatchObject({
        message: 'Moving the category under this parent would create a cycle in the category hierarchy.',
      });

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should not loop forever when an unrelated cycle already exists', async () => {
      givenCategories(
        category('category-a', null),
        category('category-x', 'category-y'),
        category('category-y', 'category-x')
      );
      (repo.update as any).mockResolvedValue(category('category-a', 'category-x'));

      await sut.execute('category-a', { parentCategoryId: 'category-x' });

      expect(repo.update).toHaveBeenCalledTimes(1);
    });

    it('should allow moving a category under a sibling', async () => {
      givenCategories(
        category('root', null),
        category('category-a', 'root'),
        category('category-b', 'root')
      );
      (repo.update as any).mockResolvedValue(category('category-a', 'category-b'));

      await sut.execute('category-a', { parentCategoryId: 'category-b' });

      expect(repo.update).toHaveBeenCalledWith('category-a', { parentCategoryId: 'category-b' });
    });

    it('should allow moving a category to the root', async () => {
      givenCategories(category('category-a', 'root'));
      (repo.update as any).mockResolvedValue(category('category-a', null));

      await sut.execute('category-a', { parentCategoryId: null });

      expect(repo.update).toHaveBeenCalledWith('category-a', { parentCategoryId: null });
    });

    it('should throw ConflictError when the new parent has another type', async () => {
      givenCategories(
        category('category-a', null, 'EXPENSE'),
        category('category-b', null, 'INCOME')
      );

      await expect(
        sut.execute('category-a', { parentCategoryId: 'category-b' })
      ).rejects.toMatchObject({
        message: 'A financial category must have the same type as its parent category.',
      });

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should check the current parent when only the type changes', async () => {
      givenCategories(
        category('category-a', 'category-b', 'EXPENSE'),
        category('category-b', null, 'EXPENSE')
      );
      givenNoChildren();

      await expect(
        sut.execute('category-a', { type: 'INCOME' as any })
      ).rejects.toMatchObject({
        message: 'A financial category must have the same type as its parent category.',
      });

      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when changing the type leaves children with another type', async () => {
      givenCategories(category('category-a', null, 'EXPENSE'));
      (repo.findMany as any).mockResolvedValue({ items: [], total: 1 });

      await expect(
        sut.execute('category-a', { type: 'INCOME' as any })
      ).rejects.toMatchObject({
        message: 'A financial category cannot change type while it has subcategories of another type.',
      });

      expect(repo.findMany).toHaveBeenCalledWith(
        { parentCategoryId: 'category-a', type: 'EXPENSE' },
        { limit: 1 }
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow changing the type of a root category without children', async () => {
      givenCategories(category('category-a', null, 'EXPENSE'));
      givenNoChildren();
      (repo.update as any).mockResolvedValue(category('category-a', null, 'INCOME'));

      await sut.execute('category-a', { type: 'INCOME' as any });

      expect(repo.update).toHaveBeenCalledWith('category-a', { type: 'INCOME' });
    });

    it('should leave a missing category to update()', async () => {
      givenCategories();
      (repo.update as any).mockResolvedValue(undefined);

      await sut.execute('missing', { parentCategoryId: 'category-b' });

      expect(repo.update).toHaveBeenCalledWith('missing', { parentCategoryId: 'category-b' });
    });
  });
});
