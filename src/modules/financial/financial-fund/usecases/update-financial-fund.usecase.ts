import { inject, injectable } from 'tsyringe';
import { UpdateFinancialFundDto } from '../dtos';
import { IFinancialFundRepository } from '../repositories/ifinancial-fund.repository';
import { FINANCIAL_FUND_REPOSITORY } from '../repositories/financial-fund.tokens';
import { FinancialFund } from '@prisma/client';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class UpdateFinancialFundUseCase {
  constructor(
    @inject(FINANCIAL_FUND_REPOSITORY)
    private readonly financialFundRepository: IFinancialFundRepository
  ) {}

  async execute(id: string, input: UpdateFinancialFundDto): Promise<FinancialFund> {
    const data: UpdateFinancialFundDto = { ...input };

    if (input.name !== undefined) {
      const name = input.name.trim().toUpperCase();
      const existing = await this.financialFundRepository.findByName(name);

      if (existing && existing.id !== id) {
        throw new ConflictError('FinancialFund name already exists!');
      }

      data.name = name;
    }

    return await this.financialFundRepository.update(id, data);
  }
}
