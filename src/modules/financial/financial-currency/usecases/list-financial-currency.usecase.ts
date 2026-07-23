import { inject, injectable } from 'tsyringe';
import { FinancialCurrency } from '@prisma/client';
import { IFinancialCurrencyRepository } from '../repositories/ifinancial-currency.repository';
import { FINANCIAL_CURRENCY_REPOSITORY } from '../repositories/financial-currency.tokens';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto'; 

@injectable()
export class ListFinancialCurrencyUseCase {
  constructor(
    @inject(FINANCIAL_CURRENCY_REPOSITORY)
    private readonly financialCurrencyRepository: IFinancialCurrencyRepository
  ) {}

  async execute(params: ListParamsDto): Promise<PaginatedResponseDto<FinancialCurrency>> {
    return this.financialCurrencyRepository.findMany({}, params);
  }

}
