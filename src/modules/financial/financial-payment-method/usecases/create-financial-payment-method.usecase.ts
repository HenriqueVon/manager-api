import { inject, injectable } from 'tsyringe';
import { FinancialPaymentMethod } from '@prisma/client';
import { IFinancialPaymentMethodRepository } from './../repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '../repositories/financial-payment-method.tokens';
import { CreateFinancialPaymentMethodDto } from '../dtos';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class CreateFinancialPaymentMethodUseCase {
  constructor(
    @inject(FINANCIAL_PAYMENT_METHOD_REPOSITORY)
    private readonly financialPaymentMethodRepository: IFinancialPaymentMethodRepository
  ) {}

  async execute(input: CreateFinancialPaymentMethodDto): Promise<FinancialPaymentMethod> {
    const name = input.name.trim().toUpperCase();

    const existing = await this.financialPaymentMethodRepository.findByName(name);
    if (existing) {
      throw new ConflictError('FinancialPaymentMethod name already exists!');
    }

    return this.financialPaymentMethodRepository.create({
      ...input,
      name
    });
  }
}
