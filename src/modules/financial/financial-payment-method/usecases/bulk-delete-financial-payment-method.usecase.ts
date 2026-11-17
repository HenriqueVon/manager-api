import { inject, injectable } from 'tsyringe';
import { IFinancialPaymentMethodRepository } from '../repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '../repositories/financial-payment-method.tokens';
import { ResourcesNotFoundError } from '@shared/errors/app-error';
import { BulkDeleteDto } from '@shared/dtos/bulk-delete.dto';

@injectable()
export class BulkDeleteFinancialPaymentMethodUseCase {
  constructor(
    @inject(FINANCIAL_PAYMENT_METHOD_REPOSITORY)
    private readonly financialPaymentMethodRepository: IFinancialPaymentMethodRepository
  ) {}

  // All or none, and the error lists the ids that stopped it: a missing id (no other record uses it).
  async execute({ ids }: BulkDeleteDto): Promise<void> {
    const existing = new Set(await this.financialPaymentMethodRepository.findExistingIds(ids));
    const missing = ids.filter((id) => !existing.has(id));

    if (missing.length > 0) {
      throw new ResourcesNotFoundError(missing);
    }

    // A single DELETE statement, so it is atomic
    await this.financialPaymentMethodRepository.deleteMany(ids);
  }
}
