import { inject, injectable } from 'tsyringe';
import { IFinancialBankAccountRepository } from '../repositories/ifinancial-bank-account.repository';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '../repositories/financial-bank-account.tokens';

@injectable()
export class DeleteFinancialBankAccountUseCase {
  constructor(
    @inject(FINANCIAL_BANK_ACCOUNT_REPOSITORY)
    private readonly financialBankAccountRepository: IFinancialBankAccountRepository
  ) {}

  async execute(id: string): Promise<void> {
    await this.financialBankAccountRepository.delete(id);
  }
}
