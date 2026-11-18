import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { AgingFinancialEntryQueryDto, FinancialEntryAgingGroupDto } from '../dtos';

@injectable()
export class AgingFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute(filters: AgingFinancialEntryQueryDto = {}): Promise<{ items: FinancialEntryAgingGroupDto[] }> {
    // The due dates are stored at midnight UTC, so "today" is the current UTC date
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const items = await this.financialEntryRepository.summarizeAging(filters, today);

    return { items };
  }
}
