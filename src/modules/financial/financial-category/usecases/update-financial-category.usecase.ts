import { inject, injectable } from 'tsyringe';
import { UpdateFinancialCategoryDto } from '../dtos';
import { IFinancialCategoryRepository } from '../repositories/ifinancial-category.repository';
import { FINANCIAL_CATEGORY_REPOSITORY } from '../repositories/financial-category.tokens';
import { FinancialCategory } from '@prisma/client';
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

    return await this.financialCategoryRepository.update(id, data);
  }
}
