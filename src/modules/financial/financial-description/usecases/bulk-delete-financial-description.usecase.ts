import { inject, injectable } from 'tsyringe';
import { IFinancialDescriptionRepository } from '../repositories/ifinancial-description.repository';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '../repositories/financial-description.tokens';
import { ResourcesInUseError, ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkDeleteDto } from '@shared/dtos/bulk-delete.dto';

@injectable()
export class BulkDeleteFinancialDescriptionUseCase {
  constructor(
    @inject(FINANCIAL_DESCRIPTION_REPOSITORY)
    private readonly financialDescriptionRepository: IFinancialDescriptionRepository
  ) {}

  // All or none, and the error lists the ids that stopped it: a missing id, or a record that other records use.
  async execute({ ids }: BulkDeleteDto): Promise<void> {
    const existing = new Set(await this.financialDescriptionRepository.findExistingIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new ResourcesNotFoundError(missing);
    }

    // Another record uses it: the 409 lists them, and the user deletes the others
    const inUse = await this.financialDescriptionRepository.findIdsInUse(ids);
    if (inUse.length > 0) {
      throw new ResourcesInUseError(inUse);
    }

    // A single DELETE statement, so it is atomic
    await this.financialDescriptionRepository.deleteMany(ids);
  }
}
