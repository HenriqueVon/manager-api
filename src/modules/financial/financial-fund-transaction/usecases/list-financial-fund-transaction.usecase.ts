import { inject, injectable } from 'tsyringe';
import { FinancialFundTransaction } from '@prisma/client';
import { IFinancialFundTransactionRepository } from '../repositories/ifinancial-fund-transaction.repository';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '../repositories/financial-fund-transaction.tokens';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto'; 

@injectable()
export class ListFinancialFundTransactionUseCase {
  constructor(
    @inject(FINANCIAL_FUND_TRANSACTION_REPOSITORY)
    private readonly financialFundTransactionRepository: IFinancialFundTransactionRepository
  ) {}

  async execute(params: ListParamsDto): Promise<PaginatedResponseDto<FinancialFundTransaction>> {
    return this.financialFundTransactionRepository.findMany({}, params);
  }

}
