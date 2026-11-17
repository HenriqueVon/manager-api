import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { FinancialEntrySummaryGroupDto, SummaryFinancialEntryQueryDto } from '../dtos';

@injectable()
export class SummaryFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute({ dueDateFrom, dueDateTo, ...filters }: SummaryFinancialEntryQueryDto = {}): Promise<{ items: FinancialEntrySummaryGroupDto[] }> {
    const items = await this.financialEntryRepository.summarize(filters, { from: dueDateFrom, to: dueDateTo });

    return { items };
  }
}
