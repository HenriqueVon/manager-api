import { inject, injectable } from 'tsyringe';
import { IFinancialFundTransactionRepository } from '../repositories/ifinancial-fund-transaction.repository';
import { FINANCIAL_FUND_TRANSACTION_REPOSITORY } from '../repositories/financial-fund-transaction.tokens';
import { ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkDeleteDto } from '@shared/dtos/bulk-delete.dto';

@injectable()
export class BulkDeleteFinancialFundTransactionUseCase {
  constructor(
    @inject(FINANCIAL_FUND_TRANSACTION_REPOSITORY)
    private readonly financialFundTransactionRepository: IFinancialFundTransactionRepository
  ) {}

  // All or none, and the error lists the ids that stopped it: a missing id (no other record uses it).
  async execute({ ids }: BulkDeleteDto): Promise<void> {
    const existing = new Set(await this.financialFundTransactionRepository.findExistingIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new ResourcesNotFoundError(missing);
    }

    // A single DELETE statement, so it is atomic
    await this.financialFundTransactionRepository.deleteMany(ids);
  }
}
