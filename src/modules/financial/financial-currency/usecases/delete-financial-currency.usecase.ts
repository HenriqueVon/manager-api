import { inject, injectable } from 'tsyringe';
import { IFinancialCurrencyRepository } from '../repositories/ifinancial-currency.repository';
import { FINANCIAL_CURRENCY_REPOSITORY } from '../repositories/financial-currency.tokens';

@injectable()
export class DeleteFinancialCurrencyUseCase {
  constructor(
    @inject(FINANCIAL_CURRENCY_REPOSITORY)
    private readonly financialCurrencyRepository: IFinancialCurrencyRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialCurrencyRepository.delete(id);
  }
}
