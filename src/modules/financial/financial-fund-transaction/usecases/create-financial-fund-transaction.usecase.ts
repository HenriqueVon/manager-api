import { inject, injectable } from 'tsyringe';
import { FinancialFundTransaction } from '@prisma/client';
import { IFinancialFundTransactionRepository } from './../repositories/ifinancial-fund-transaction.repository';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '../repositories/financial-fund-transaction.tokens';
import { CreateFinancialFundTransactionDto } from '../dtos';
import { BadRequestError } from '@shared/errors/app-error';

@injectable()
export class CreateFinancialFundTransactionUseCase {
  constructor(
    @inject(FINANCIAL_FUND_TRANSACTION_REPOSITORY)
    private readonly financialFundTransactionRepository: IFinancialFundTransactionRepository
  ) {}

  async execute(input: CreateFinancialFundTransactionDto): Promise<FinancialFundTransaction> {
    if (input.amountCredit > 0 && input.amountDebit > 0) {
      throw new BadRequestError('Both amountCredit and amountDebit cannot be greater than 0 at the same time');
    }

    if (input.amountCredit === 0 && input.amountDebit === 0) {
      throw new BadRequestError('Both amountCredit and amountDebit cannot be 0 at the same time');
    }

    return this.financialFundTransactionRepository.create(input);
  }
}
