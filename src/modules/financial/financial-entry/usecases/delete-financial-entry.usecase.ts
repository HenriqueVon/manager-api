import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';

@injectable()
export class DeleteFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialEntryRepository.delete(id);
  }
}
