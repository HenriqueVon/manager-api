import { inject, injectable } from 'tsyringe';
import { IFinancialFundTransactionRepository } from '../repositories/ifinancial-fund-transaction.repository';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '../repositories/financial-fund-transaction.tokens';

@injectable()
export class DeleteFinancialFundTransactionUseCase {
  constructor(
    @inject(FINANCIAL_FUND_TRANSACTION_REPOSITORY)
    private readonly financialFundTransactionRepository: IFinancialFundTransactionRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialFundTransactionRepository.delete(id);
  }
}
