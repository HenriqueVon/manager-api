import { inject, injectable } from 'tsyringe';
import { FinancialFund } from '@prisma/client';
import { IFinancialFundRepository } from './../repositories/ifinancial-fund.repository';
import { FINANCIAL_FUND_REPOSITORY } from '../repositories/financial-fund.tokens';
import { CreateFinancialFundDto } from '../dtos';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class CreateFinancialFundUseCase {
  constructor(
    @inject(FINANCIAL_FUND_REPOSITORY)
    private readonly financialFundRepository: IFinancialFundRepository
  ) {}

  async execute(input: CreateFinancialFundDto): Promise<FinancialFund> {
    const name = input.name.trim().toUpperCase();

    const existing = await this.financialFundRepository.findMany(
      { name, 
        ledgerId: input.ledgerId 
      }, 
      { limit: 1 });    

    if (existing.total > 0) {
      throw new ConflictError('FinancialFund name already exists!');
    }

    return this.financialFundRepository.create({
      ...input,
      name
    });
  }
}
