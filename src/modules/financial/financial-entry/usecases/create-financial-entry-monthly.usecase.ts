import { inject, injectable } from 'tsyringe';
import { FinancialEntry } from '@prisma/client';
import { IFinancialEntryRepository } from './../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { CreateFinancialEntryDto, CreateFinancialEntryMonthlyDto } from '../dtos';
import { addMonths } from './add-months';

@injectable()
export class CreateFinancialEntryMonthlyUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  // Repeats the same entry every month, saved together: all of them or none.
  async execute(input: CreateFinancialEntryMonthlyDto): Promise<FinancialEntry[]> {
    const { repeatCount, dueDate, ...common } = input;

    const entries: CreateFinancialEntryDto[] = Array.from({ length: repeatCount }, (_, index) => ({
      ...common,
      dueDate     : addMonths(dueDate, index),
      paymentDate : null,
      amountPaid  : 0,
      isMonthly   : true,
    }));

    return this.financialEntryRepository.createMany(entries);
  }
}
