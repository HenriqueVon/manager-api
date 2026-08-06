import { inject, injectable } from 'tsyringe';
import { FinancialEntry } from '@prisma/client';
import { IFinancialEntryRepository } from './../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { CreateFinancialEntryDto } from '../dtos';

@injectable()
export class CreateFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute(input: CreateFinancialEntryDto): Promise<FinancialEntry> {
    return this.financialEntryRepository.create(input);
  }
}
