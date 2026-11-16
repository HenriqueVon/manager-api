import { inject, injectable } from 'tsyringe';
import { FinancialEntry } from '@prisma/client';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { ListFinancialEntryFiltersDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class ListFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute(
    params: ListParamsDto,
    { dueDateFrom, dueDateTo, ...filters }: ListFinancialEntryFiltersDto = {}
  ): Promise<PaginatedResponseDto<FinancialEntry>> {
    return this.financialEntryRepository.findMany(filters, params, { from: dueDateFrom, to: dueDateTo });
  }

}
