import { inject, injectable } from 'tsyringe';
import { FinancialCurrency } from '@prisma/client';
import { IFinancialCurrencyRepository } from '../repositories/ifinancial-currency.repository';
import { FINANCIAL_CURRENCY_REPOSITORY } from '../repositories/financial-currency.tokens';

@injectable()
export class ListFinancialCurrencyUseCase {
  constructor(
    @inject(FINANCIAL_CURRENCY_REPOSITORY)
    private readonly financialCurrencyRepository: IFinancialCurrencyRepository
  ) {}

  async execute(): Promise<FinancialCurrency[]> {
    return this.financialCurrencyRepository.findMany();
  }
}
