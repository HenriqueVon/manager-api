import { inject, injectable } from 'tsyringe';
import { IFinancialFundRepository } from '../repositories/ifinancial-fund.repository';
import { FINANCIAL_FUND_REPOSITORY } from '../repositories/financial-fund.tokens';
import { ResourcesInUseError, ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkDeleteDto } from '@shared/dtos/bulk-delete.dto';

@injectable()
export class BulkDeleteFinancialFundUseCase {
  constructor(
    @inject(FINANCIAL_FUND_REPOSITORY)
    private readonly financialFundRepository: IFinancialFundRepository
  ) {}

  // All or none, and the error lists the ids that stopped it: a missing id, or a record that other records use.
  async execute({ ids }: BulkDeleteDto): Promise<void> {
    const existing = new Set(await this.financialFundRepository.findExistingIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new ResourcesNotFoundError(missing);
    }

    // Another record uses it: the 409 lists them, and the user deletes the others
    const inUse = await this.financialFundRepository.findIdsInUse(ids);
    if (inUse.length > 0) {
      throw new ResourcesInUseError(inUse);
    }

    // A single DELETE statement, so it is atomic
    await this.financialFundRepository.deleteMany(ids);
  }
}
