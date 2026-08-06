import { inject, injectable } from 'tsyringe';
import { IFinancialCategoryRepository } from '../repositories/ifinancial-category.repository';
import { FINANCIAL_CATEGORY_REPOSITORY } from '../repositories/financial-category.tokens';
import { FinancialCategory } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialCategoryUseCase {
  constructor(
    @inject(FINANCIAL_CATEGORY_REPOSITORY)
    private readonly financialCategoryRepository: IFinancialCategoryRepository
  ) {}

  async execute(id: string): Promise<FinancialCategory | null> {
    const financialCategory = await this.financialCategoryRepository.findById(id);

    if (!financialCategory) {
      throw new NotFoundError();
    }

    return financialCategory;
  }
}
