import { inject, injectable } from 'tsyringe';
import { FinancialPaymentMethod } from '@prisma/client';
import { IFinancialPaymentMethodRepository } from '../repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '../repositories/financial-payment-method.tokens';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto'; 

@injectable()
export class ListFinancialPaymentMethodUseCase {
  constructor(
    @inject(FINANCIAL_PAYMENT_METHOD_REPOSITORY)
    private readonly financialPaymentMethodRepository: IFinancialPaymentMethodRepository
  ) {}

  async execute(params: ListParamsDto): Promise<PaginatedResponseDto<FinancialPaymentMethod>> {
    return this.financialPaymentMethodRepository.findMany({}, params);
  }

}
