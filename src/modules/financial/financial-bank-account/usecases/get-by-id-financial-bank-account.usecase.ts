import { inject, injectable } from 'tsyringe';
import { IFinancialBankAccountRepository } from '../repositories/ifinancial-bank-account.repository';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '../repositories/financial-bank-account.tokens';
import { FinancialBankAccount } from '@prisma/client';
import { NotFoundError } from '@shared/errors/app-error';

@injectable()
export class GetByIdFinancialBankAccountUseCase {
  constructor(
    @inject(FINANCIAL_BANK_ACCOUNT_REPOSITORY)
    private readonly financialBankAccountRepository: IFinancialBankAccountRepository
  ) {}

  async execute(id: string): Promise<FinancialBankAccount | null> {
    const financialBankAccount = await this.financialBankAccountRepository.findById(id);

    if (!financialBankAccount) {
      throw new NotFoundError();
    }

    return financialBankAccount;
  }
}
