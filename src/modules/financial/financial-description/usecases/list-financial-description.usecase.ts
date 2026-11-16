import { inject, injectable } from 'tsyringe';
import { FinancialDescription } from '@prisma/client';
import { IFinancialDescriptionRepository } from '../repositories/ifinancial-description.repository';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '../repositories/financial-description.tokens';
import { ListFinancialDescriptionFiltersDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class ListFinancialDescriptionUseCase {
  constructor(
    @inject(FINANCIAL_DESCRIPTION_REPOSITORY)
    private readonly financialDescriptionRepository: IFinancialDescriptionRepository
  ) {}

  async execute(
    params: ListParamsDto,
    { search, ...filters }: ListFinancialDescriptionFiltersDto = {}
  ): Promise<PaginatedResponseDto<FinancialDescription>> {
    return this.financialDescriptionRepository.findMany({ ...filters, description: filters.description?.trim().toUpperCase() }, params, search);
  }
}
