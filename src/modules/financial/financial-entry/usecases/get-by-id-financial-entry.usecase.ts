import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { FinancialEntry } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute(id: string): Promise<FinancialEntry | null> {
    const financialEntry = await this.financialEntryRepository.findById(id);

    if (!financialEntry) {
      throw new NotFoundError();
    }

    return financialEntry;
  }
}
