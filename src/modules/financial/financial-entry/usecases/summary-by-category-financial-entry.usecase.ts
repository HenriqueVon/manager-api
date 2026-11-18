import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { FinancialEntrySummaryCategoryDto, SummaryBreakdownFinancialEntryQueryDto } from '../dtos';

@injectable()
export class SummaryByCategoryFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute({ dueDateFrom, dueDateTo, ...filters }: SummaryBreakdownFinancialEntryQueryDto = {}): Promise<{ items: FinancialEntrySummaryCategoryDto[] }> {
    const items = await this.financialEntryRepository.summarizeByCategory(filters, { from: dueDateFrom, to: dueDateTo });

    return { items };
  }
}
