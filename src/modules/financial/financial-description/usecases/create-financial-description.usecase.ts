import { inject, injectable } from 'tsyringe';
import { FinancialDescription } from '@prisma/client';
import { IFinancialDescriptionRepository } from './../repositories/ifinancial-description.repository';
import { FINANCIAL_DESCRIPTION_REPOSITORY } from '../repositories/financial-description.tokens';
import { CreateFinancialDescriptionDto } from '../dtos';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class CreateFinancialDescriptionUseCase {
  constructor(
    @inject(FINANCIAL_DESCRIPTION_REPOSITORY)
    private readonly financialDescriptionRepository: IFinancialDescriptionRepository
  ) {}

  async execute(input: CreateFinancialDescriptionDto): Promise<FinancialDescription> {
    const description = input.description.trim().toUpperCase();

    const existing = await this.financialDescriptionRepository.findByDescription(description);
    if (existing) {
      throw new ConflictError('FinancialDescription description already exists!');
    }

    return this.financialDescriptionRepository.create({
      ...input,
      description
    });
  }
}
