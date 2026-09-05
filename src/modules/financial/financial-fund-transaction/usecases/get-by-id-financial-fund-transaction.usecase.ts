import { inject, injectable } from 'tsyringe';
import { IFinancialFundTransactionRepository } from '../repositories/ifinancial-fund-transaction.repository';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '../repositories/financial-fund-transaction.tokens';
import { FinancialFundTransaction } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialFundTransactionUseCase {
  constructor(
    @inject(FINANCIAL_FUND_TRANSACTION_REPOSITORY)
    private readonly financialFundTransactionRepository: IFinancialFundTransactionRepository
  ) {}

  async execute(id: string): Promise<FinancialFundTransaction | null> {
    const financialFundTransaction = await this.financialFundTransactionRepository.findById(id);

    if (!financialFundTransaction) {
      throw new NotFoundError();
    }

    return financialFundTransaction;
  }
}
