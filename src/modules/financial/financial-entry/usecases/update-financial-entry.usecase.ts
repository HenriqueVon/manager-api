import { inject, injectable } from 'tsyringe';
import { UpdateFinancialEntryDto } from '../dtos';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { FinancialEntry } from '@prisma/client';

@injectable()
export class UpdateFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute(id: string, input: UpdateFinancialEntryDto): Promise<FinancialEntry> {
    return this.financialEntryRepository.update(id, input);
  }
}
