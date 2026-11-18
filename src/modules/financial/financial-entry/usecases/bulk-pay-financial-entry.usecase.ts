import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { ResourcesAlreadyPaidError, ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkPayFinancialEntryDto } from '../dtos';

@injectable()
export class BulkPayFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  // Marks the entries as paid (or received): the payment date is the due date and the amount paid is the amount.
  // All or none: when some id does not exist or is already paid, nothing is changed and the error lists those ids.
  async execute({ ids }: BulkPayFinancialEntryDto): Promise<void> {
    const { missingIds, paidIds } = await this.financialEntryRepository.payMany(ids);

    if (missingIds.length > 0) {
      throw new ResourcesNotFoundError(missingIds);
    }

    if (paidIds.length > 0) {
      throw new ResourcesAlreadyPaidError(paidIds);
    }
  }
}
