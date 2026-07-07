import { inject, injectable } from 'tsyringe';
import { UpdateFinancialCurrencyDto } from '../dtos';
import { IFinancialCurrencyRepository } from '../repositories/ifinancial-currency.repository';
import { FINANCIAL_CURRENCY_REPOSITORY } from '../repositories/financial-currency.tokens';
import { FinancialCurrency } from '@prisma/client';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class UpdateFinancialCurrencyUseCase {
  constructor(
    @inject(FINANCIAL_CURRENCY_REPOSITORY)
    private readonly financialCurrencyRepository: IFinancialCurrencyRepository
  ) {}

  async execute(id: string, input: UpdateFinancialCurrencyDto): Promise<FinancialCurrency> {
    const data: UpdateFinancialCurrencyDto = { ...input };

    if (input.name !== undefined) {
      const name = input.name.trim().toUpperCase();
      const existing = await this.financialCurrencyRepository.findByName(name);

      if (existing && existing.id !== id) {
        throw new ConflictError('FinancialCurrency name already exists!');
      }

      data.name = name;
    }

    return await this.financialCurrencyRepository.update(id, data);
  }
}
