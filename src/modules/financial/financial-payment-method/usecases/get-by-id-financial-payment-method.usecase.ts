import { inject, injectable } from 'tsyringe';
import { IFinancialPaymentMethodRepository } from '../repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '../repositories/financial-payment-method.tokens';
import { FinancialPaymentMethod } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialPaymentMethodUseCase {
  constructor(
    @inject(FINANCIAL_PAYMENT_METHOD_REPOSITORY)
    private readonly financialPaymentMethodRepository: IFinancialPaymentMethodRepository
  ) {}

  async execute(id: string): Promise<FinancialPaymentMethod | null> {
    const financialPaymentMethod = await this.financialPaymentMethodRepository.findById(id);

    if (!financialPaymentMethod) {
      throw new NotFoundError();
    }

    return financialPaymentMethod;
  }
}
