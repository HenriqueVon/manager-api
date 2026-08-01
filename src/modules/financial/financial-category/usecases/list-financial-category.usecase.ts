import { inject, injectable } from 'tsyringe';
import { FinancialCategory } from '@prisma/client';
import { IFinancialCategoryRepository } from '../repositories/ifinancial-category.repository';
import { FINANCIAL_CATEGORY_REPOSITORY } from '../repositories/financial-category.tokens';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto'; 

@injectable()
export class ListFinancialCategoryUseCase {
  constructor(
    @inject(FINANCIAL_CATEGORY_REPOSITORY)
    private readonly financialCategoryRepository: IFinancialCategoryRepository
  ) {}

  async execute(params: ListParamsDto): Promise<PaginatedResponseDto<FinancialCategory>> {
    return this.financialCategoryRepository.findMany({}, params);
  }

}
