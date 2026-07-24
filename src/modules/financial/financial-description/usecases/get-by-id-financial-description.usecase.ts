import { inject, injectable } from 'tsyringe';
import { IFinancialDescriptionRepository } from '../repositories/ifinancial-description.repository';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '../repositories/financial-description.tokens';
import { FinancialDescription } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialDescriptionUseCase {
  constructor(
    @inject(FINANCIAL_DESCRIPTION_REPOSITORY)
    private readonly financialDescriptionRepository: IFinancialDescriptionRepository
  ) {}

  async execute(id: string): Promise<FinancialDescription | null> {
    const financialDescription = await this.financialDescriptionRepository.findById(id);

    if (!financialDescription) {
      throw new NotFoundError();
    }

    return financialDescription;
  }
}
