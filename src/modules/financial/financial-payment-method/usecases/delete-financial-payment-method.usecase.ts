import { inject, injectable } from 'tsyringe';
import { IFinancialPaymentMethodRepository } from '../repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '../repositories/financial-payment-method.tokens';

@injectable()
export class DeleteFinancialPaymentMethodUseCase {
  constructor(
    @inject(FINANCIAL_PAYMENT_METHOD_REPOSITORY)
    private readonly financialPaymentMethodRepository: IFinancialPaymentMethodRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialPaymentMethodRepository.delete(id);
  }
}
