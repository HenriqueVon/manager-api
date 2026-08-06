import { inject, injectable } from 'tsyringe';
import { FinancialCategory } from '@prisma/client';
import { IFinancialCategoryRepository } from './../repositories/ifinancial-category.repository';
import { FINANCIAL_CATEGORY_REPOSITORY } from '../repositories/financial-category.tokens';
import { CreateFinancialCategoryDto } from '../dtos';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class CreateFinancialCategoryUseCase {
  constructor(
    @inject(FINANCIAL_CATEGORY_REPOSITORY)
    private readonly financialCategoryRepository: IFinancialCategoryRepository
  ) {}

  async execute(input: CreateFinancialCategoryDto): Promise<FinancialCategory> {
    const existingCategory = await this.financialCategoryRepository.findMany(
      {
        ledgerId         : input.ledgerId,
        parentCategoryId : input.parentCategoryId,
        name             : input.name.trim().toUpperCase(),
      },
      { limit: 1 }
    );

    if (existingCategory.total > 0) {
      throw new ConflictError(
        'A financial category with the same name already exists in this ledger and parent category.'
      );
    }

    return this.financialCategoryRepository.create(input);
  }
}
