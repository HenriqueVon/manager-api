import { inject, injectable } from 'tsyringe';
import { IFinancialDescriptionRepository } from '../repositories/ifinancial-description.repository';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '../repositories/financial-description.tokens';

@injectable()
export class DeleteFinancialDescriptionUseCase {
  constructor(
    @inject(FINANCIAL_DESCRIPTION_REPOSITORY)
    private readonly financialDescriptionRepository: IFinancialDescriptionRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialDescriptionRepository.delete(id);
  }
}
