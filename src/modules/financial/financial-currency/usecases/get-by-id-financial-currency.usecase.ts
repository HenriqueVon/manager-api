import { inject, injectable } from 'tsyringe';
import { IFinancialCurrencyRepository } from '../repositories/ifinancial-currency.repository';
import { FINANCIAL_CURRENCY_REPOSITORY } from '../repositories/financial-currency.tokens';
import { FinancialCurrency } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialCurrencyUseCase {
  constructor(
    @inject(FINANCIAL_CURRENCY_REPOSITORY)
    private readonly financialCurrencyRepository: IFinancialCurrencyRepository
  ) {}

  async execute(id: string): Promise<FinancialCurrency | null> {
    const financialCurrency = await this.financialCurrencyRepository.findById(id);

    if (!financialCurrency) {
      throw new NotFoundError();
    }

    return financialCurrency;
  }
}
