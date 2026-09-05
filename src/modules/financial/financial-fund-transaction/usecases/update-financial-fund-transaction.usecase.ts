import { inject, injectable } from 'tsyringe';
import { UpdateFinancialFundTransactionDto } from '../dtos';
import { IFinancialFundTransactionRepository } from '../repositories/ifinancial-fund-transaction.repository';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '../repositories/financial-fund-transaction.tokens';
import { FinancialFundTransaction } from '@prisma/client';
import { BadRequestError } from '@shared/errors/app-error';


@injectable()
export class UpdateFinancialFundTransactionUseCase {
  constructor(
    @inject(FINANCIAL_FUND_TRANSACTION_REPOSITORY)
    private readonly financialFundTransactionRepository: IFinancialFundTransactionRepository
  ) {}

  async execute(id: string, input: UpdateFinancialFundTransactionDto): Promise<FinancialFundTransaction> {
    const data: UpdateFinancialFundTransactionDto = { ...input };

    if (data.amountCredit !== undefined && data.amountDebit !== undefined) {
      if (data.amountCredit > 0 && data.amountDebit > 0) {
        throw new BadRequestError('Both amountCredit and amountDebit cannot be greater than 0 at the same time');
      }

      if (data.amountCredit === 0 && data.amountDebit === 0) {
        throw new BadRequestError('Both amountCredit and amountDebit cannot be 0 at the same time');
      }
    }

    return await this.financialFundTransactionRepository.update(id, data);
  }
}
