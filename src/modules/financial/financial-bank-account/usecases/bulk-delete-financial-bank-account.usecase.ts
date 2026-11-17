import { inject, injectable } from 'tsyringe';
import { IFinancialBankAccountRepository } from '../repositories/ifinancial-bank-account.repository';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '../repositories/financial-bank-account.tokens';
import { ResourcesInUseError, ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkDeleteDto } from '@shared/dtos/bulk-delete.dto';

@injectable()
export class BulkDeleteFinancialBankAccountUseCase {
  constructor(
    @inject(FINANCIAL_BANK_ACCOUNT_REPOSITORY)
    private readonly financialBankAccountRepository: IFinancialBankAccountRepository
  ) {}

  // All or none, and the error lists the ids that stopped it: a missing id, or a record that other records use.
  async execute({ ids }: BulkDeleteDto): Promise<void> {
    const existing = new Set(await this.financialBankAccountRepository.findExistingIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new ResourcesNotFoundError(missing);
    }

    // Another record uses it: the 409 lists them, and the user deletes the others
    const inUse = await this.financialBankAccountRepository.findIdsInUse(ids);
    if (inUse.length > 0) {
      throw new ResourcesInUseError(inUse);
    }

    // A single DELETE statement, so it is atomic
    await this.financialBankAccountRepository.deleteMany(ids);
  }
}
