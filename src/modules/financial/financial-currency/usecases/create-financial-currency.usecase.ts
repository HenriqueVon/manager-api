import { inject, injectable } from 'tsyringe';
import { FinancialCurrency } from '@prisma/client';
import { IFinancialCurrencyRepository } from './../repositories/ifinancial-currency.repository';
import { FINANCIAL_CURRENCY_REPOSITORY } from '../repositories/financial-currency.tokens';
import { CreateFinancialCurrencyDto } from '../dtos';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class CreateFinancialCurrencyUseCase {
  constructor(
    @inject(FINANCIAL_CURRENCY_REPOSITORY)
    private readonly financialCurrencyRepository: IFinancialCurrencyRepository
  ) {}

  async execute(input: CreateFinancialCurrencyDto): Promise<FinancialCurrency> {
    const name = input.name.trim().toUpperCase();

    const existing = await this.financialCurrencyRepository.findByName(name);
    if (existing) {
      throw new ConflictError('FinancialCurrency name already exists!');
    }

    return this.financialCurrencyRepository.create({
      ...input,
      name
    });
  }
}
