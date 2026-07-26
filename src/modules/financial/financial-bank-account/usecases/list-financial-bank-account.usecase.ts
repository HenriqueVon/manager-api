import { inject, injectable } from 'tsyringe';
import { FinancialBankAccount } from '@prisma/client';
import { IFinancialBankAccountRepository } from '../repositories/ifinancial-bank-account.repository';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '../repositories/financial-bank-account.tokens';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto'; 

@injectable()
export class ListFinancialBankAccountUseCase {
  constructor(
    @inject(FINANCIAL_BANK_ACCOUNT_REPOSITORY)
    private readonly financialBankAccountRepository: IFinancialBankAccountRepository
  ) {}

  async execute(params: ListParamsDto): Promise<PaginatedResponseDto<FinancialBankAccount>> {
    return this.financialBankAccountRepository.findMany({}, params);
  }

}
