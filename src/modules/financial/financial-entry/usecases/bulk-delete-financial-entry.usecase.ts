import { inject, injectable } from 'tsyringe';
import { IFinancialEntryRepository } from '../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkDeleteDto } from '@shared/dtos/bulk-delete.dto';

@injectable()
export class BulkDeleteFinancialEntryUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  // All or none: when some id does not exist, nothing is deleted and the error lists the ids that are missing.
  // Nothing references an entry, so a missing id is the only reason an entry cannot be deleted.
  async execute({ ids }: BulkDeleteDto): Promise<void> {
    const existing = new Set(await this.financialEntryRepository.findExistingIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new ResourcesNotFoundError(missing);
    }

    // A single DELETE statement, so it is atomic
    await this.financialEntryRepository.deleteMany(ids);
  }
}
