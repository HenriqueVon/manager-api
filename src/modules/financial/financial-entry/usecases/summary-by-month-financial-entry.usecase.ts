import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { FinancialEntrySummaryMonthDto, SummaryBreakdownFinancialEntryQueryDto } from '../dtos';

@injectable()
export class SummaryByMonthFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute({ dueDateFrom, dueDateTo, ...filters }: SummaryBreakdownFinancialEntryQueryDto = {}): Promise<{ items: FinancialEntrySummaryMonthDto[] }> {
    const items = await this.financialEntryRepository.summarizeByMonth(filters, { from: dueDateFrom, to: dueDateTo });

    return { items };
  }
}
