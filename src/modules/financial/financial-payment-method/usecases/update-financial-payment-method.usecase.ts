import { inject, injectable } from 'tsyringe';
import { UpdateFinancialPaymentMethodDto } from '../dtos';
import { IFinancialPaymentMethodRepository } from '../repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '../repositories/financial-payment-method.tokens';
import { FinancialPaymentMethod } from '@prisma/client';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class UpdateFinancialPaymentMethodUseCase {
  constructor(
    @inject(FINANCIAL_PAYMENT_METHOD_REPOSITORY)
    private readonly financialPaymentMethodRepository: IFinancialPaymentMethodRepository
  ) {}

  async execute(id: string, input: UpdateFinancialPaymentMethodDto): Promise<FinancialPaymentMethod> {
    const data: UpdateFinancialPaymentMethodDto = { ...input };

    if (input.name !== undefined) {
      const name = input.name.trim().toUpperCase();
      const existing = await this.financialPaymentMethodRepository.findByName(name);

      if (existing && existing.id !== id) {
        throw new ConflictError('FinancialPaymentMethod name already exists!');
      }

      data.name = name;
    }

    return await this.financialPaymentMethodRepository.update(id, data);
  }
}
