import { inject, injectable } from 'tsyringe';
import { FinancialBankAccount } from '@prisma/client';
import { IFinancialBankAccountRepository } from './../repositories/ifinancial-bank-account.repository';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '../repositories/financial-bank-account.tokens';
import { CreateFinancialBankAccountDto } from '../dtos';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class CreateFinancialBankAccountUseCase {
  constructor(
    @inject(FINANCIAL_BANK_ACCOUNT_REPOSITORY)
    private readonly financialBankAccountRepository: IFinancialBankAccountRepository
  ) {}

  async execute(input: CreateFinancialBankAccountDto): Promise<FinancialBankAccount> {
    const name = input.name.trim().toUpperCase();

    const existing = await this.financialBankAccountRepository.findByName(name);
    if (existing) {
      throw new ConflictError('FinancialBankAccount name already exists!');
    }

    return this.financialBankAccountRepository.create({
      ...input,
      name
    });
  }
}
