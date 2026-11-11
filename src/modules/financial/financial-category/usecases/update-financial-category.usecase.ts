import { inject, injectable } from 'tsyringe';
import { UpdateFinancialCategoryDto } from '../dtos';
import { IFinancialCategoryRepository } from '../repositories/ifinancial-category.repository';
import { FINANCIAL_CATEGORY_REPOSITORY } from '../repositories/financial-category.tokens';
import { FinancialCategory, FinancialCategoryType } from '@prisma/client';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class UpdateFinancialCategoryUseCase {
  constructor(
    @inject(FINANCIAL_CATEGORY_REPOSITORY)
    private readonly financialCategoryRepository: IFinancialCategoryRepository
  ) {}

  async execute(id: string, input: UpdateFinancialCategoryDto): Promise<FinancialCategory> {
    const data: UpdateFinancialCategoryDto = { ...input };

    if (input.name !== undefined) {
      const name = input.name.trim().toUpperCase();
      const existingCategory = await this.financialCategoryRepository.findMany(
        {
          ledgerId         : input.ledgerId,
          parentCategoryId : input.parentCategoryId,
          name             : name,
        },
        { limit: 1 }
      );

      if (existingCategory.total > 0 && existingCategory.items[0].id !== id) {
        throw new ConflictError(
          'A financial category with the same name already exists in this ledger and parent category.'
        );
      }

      data.name = name;
    }

    await this.validateHierarchy(id, input);

    return await this.financialCategoryRepository.update(id, data);
  }

  private async validateHierarchy(id: string, input: UpdateFinancialCategoryDto): Promise<void> {
    if (input.parentCategoryId === undefined && input.type === undefined) {
      return;
    }

    const current = await this.financialCategoryRepository.findById(id);

    // A missing record skips the checks; update() still returns the 404 through prismaCall.
    if (!current) {
      return;
    }

    const parentCategoryId = input.parentCategoryId === undefined
      ? current.parentCategoryId
      : input.parentCategoryId;
    const type = input.type ?? current.type;

    if (parentCategoryId === id) {
      throw new ConflictError('A financial category cannot be its own parent.');
    }

    if (parentCategoryId) {
      const parent = await this.financialCategoryRepository.findById(parentCategoryId);

      if (parent && parent.type !== type) {
        throw new ConflictError('A financial category must have the same type as its parent category.');
      }

      if (parent && input.parentCategoryId !== undefined) {
        await this.assertNoCycle(id, parent);
      }
    }

    if (input.type !== undefined) {
      await this.assertChildrenHaveType(id, type);
    }
  }

  // Walks from the new parent up to the root; reaching the category itself means a cycle.
  private async assertNoCycle(id: string, newParent: FinancialCategory): Promise<void> {
    const visited = new Set<string>();
    let ancestor: FinancialCategory | null = newParent;

    while (ancestor && !visited.has(ancestor.id)) {
      if (ancestor.id === id) {
        throw new ConflictError(
          'Moving the category under this parent would create a cycle in the category hierarchy.'
        );
      }

      visited.add(ancestor.id);
      ancestor = ancestor.parentCategoryId
        ? await this.financialCategoryRepository.findById(ancestor.parentCategoryId)
        : null;
    }
  }

  private async assertChildrenHaveType(id: string, type: FinancialCategoryType): Promise<void> {
    const otherTypes = Object.values(FinancialCategoryType).filter((other) => other !== type);

    for (const otherType of otherTypes) {
      const children = await this.financialCategoryRepository.findMany(
        { parentCategoryId: id, type: otherType },
        { limit: 1 }
      );

      if (children.total > 0) {
        throw new ConflictError(
          'A financial category cannot change type while it has subcategories of another type.'
        );
      }
    }
  }
}
