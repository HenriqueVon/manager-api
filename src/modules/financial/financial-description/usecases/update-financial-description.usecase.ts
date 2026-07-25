import { inject, injectable } from 'tsyringe';
import { UpdateFinancialDescriptionDto } from '../dtos';
import { IFinancialDescriptionRepository } from '../repositories/ifinancial-description.repository';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '../repositories/financial-description.tokens';
import { FinancialDescription } from '@prisma/client';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class UpdateFinancialDescriptionUseCase {
  constructor(
    @inject(FINANCIAL_DESCRIPTION_REPOSITORY)
    private readonly financialDescriptionRepository: IFinancialDescriptionRepository
  ) {}

  async execute(id: string, input: UpdateFinancialDescriptionDto): Promise<FinancialDescription> {
    const data: UpdateFinancialDescriptionDto = { ...input };

    if (input.description !== undefined) {
      const description = input.description.trim().toUpperCase();
      const existing = await this.financialDescriptionRepository.findByDescription(description);

      if (existing && existing.id !== id) {
        throw new ConflictError('FinancialDescription description already exists!');
      }

      data.description = description;
    }

    return await this.financialDescriptionRepository.update(id, data);
  }
}
