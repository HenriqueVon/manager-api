import { inject, injectable } from 'tsyringe';
import { IFinancialFundRepository } from '../repositories/ifinancial-fund.repository';
import { FINANCIAL_FUND_REPOSITORY } from '../repositories/financial-fund.tokens';

@injectable()
export class DeleteFinancialFundUseCase {
  constructor(
    @inject(FINANCIAL_FUND_REPOSITORY)
    private readonly financialFundRepository: IFinancialFundRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialFundRepository.delete(id);
  }
}
