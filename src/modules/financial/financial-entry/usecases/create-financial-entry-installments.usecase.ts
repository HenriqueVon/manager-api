import { inject, injectable } from 'tsyringe';
import { FinancialEntry } from '@prisma/client';
import { IFinancialEntryRepository } from './../repositories/ifinancial-entry.repository';
import { FINANCIAL_ENTRY_REPOSITORY } from '../repositories/financial-entry.tokens';
import { CreateFinancialEntryDto, CreateFinancialEntryInstallmentsDto } from '../dtos';
import { addMonths } from './add-months';

@injectable()
export class CreateFinancialEntryInstallmentsUseCase {
  constructor(
    @inject(FINANCIAL_ENTRY_REPOSITORY)
    private readonly financialEntryRepository: IFinancialEntryRepository
  ) {}

  async execute(input: CreateFinancialEntryInstallmentsDto): Promise<FinancialEntry[]> {
    const { installments, amount, dueDate, additionalDescription, ...common } = input;
    const amounts = this.splitAmount(amount, installments);

    const entries: CreateFinancialEntryDto[] = amounts.map((installmentAmount, index) => ({
      ...common,
      dueDate               : addMonths(dueDate, index),
      paymentDate           : null,
      amount                : installmentAmount,
      amountPaid            : 0,
      additionalDescription : this.describe(additionalDescription, index + 1, installments),
      isMonthly             : false,
    }));

    return this.financialEntryRepository.createMany(entries);
  }

  // Works in cents so the installments always add up to the total. The cents left over go to the last one:
  // 4000 in 3 installments is 1333.33, 1333.33 and 1333.34.
  private splitAmount(total: number, installments: number): number[] {
    const totalInCents = Math.round(total * 100);
    const base = Math.floor(totalInCents / installments);
    const last = totalInCents - base * (installments - 1);

    return Array.from({ length: installments }, (_, index) => (index === installments - 1 ? last : base) / 100);
  }

  private describe(complement: string | null | undefined, number: number, total: number): string {
    return complement ? `${complement} ${number}/${total}` : `${number}/${total}`;
  }
}
