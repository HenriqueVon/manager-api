import { inject, injectable } from 'tsyringe';
import { IFinancialCategoryRepository } from '../repositories/ifinancial-category.repository';
import { FINANCIAL_CATEGORY_REPOSITORY } from '../repositories/financial-category.tokens';

@injectable()
export class DeleteFinancialCategoryUseCase {
  constructor(
    @inject(FINANCIAL_CATEGORY_REPOSITORY)
    private readonly financialCategoryRepository: IFinancialCategoryRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialCategoryRepository.delete(id);
  }
}
