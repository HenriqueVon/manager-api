import { inject, injectable } from 'tsyringe';
import { IFinancialFundRepository } from '../repositories/ifinancial-fund.repository';
import { FINANCIAL_FUND_REPOSITORY } from '../repositories/financial-fund.tokens';
import { FinancialFund } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialFundUseCase {
  constructor(
    @inject(FINANCIAL_FUND_REPOSITORY)
    private readonly financialFundRepository: IFinancialFundRepository
  ) {}

  async execute(id: string): Promise<FinancialFund | null> {
    const financialFund = await this.financialFundRepository.findById(id);

    if (!financialFund) {
      throw new NotFoundError();
    }

    return financialFund;
  }
}
