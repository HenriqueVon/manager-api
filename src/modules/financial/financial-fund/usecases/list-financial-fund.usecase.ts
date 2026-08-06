import { inject, injectable } from 'tsyringe';
import { FinancialFund } from '@prisma/client';
import { IFinancialFundRepository } from '../repositories/ifinancial-fund.repository';
import { FINANCIAL_FUND_REPOSITORY } from '../repositories/financial-fund.tokens';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto'; 

@injectable()
export class ListFinancialFundUseCase {
  constructor(
    @inject(FINANCIAL_FUND_REPOSITORY)
    private readonly financialFundRepository: IFinancialFundRepository
  ) {}

  async execute(params: ListParamsDto): Promise<PaginatedResponseDto<FinancialFund>> {
    return this.financialFundRepository.findMany({}, params);
  }

}
