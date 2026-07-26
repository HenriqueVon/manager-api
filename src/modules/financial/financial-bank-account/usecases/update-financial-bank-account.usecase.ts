import { inject, injectable } from 'tsyringe';
import { UpdateFinancialBankAccountDto } from '../dtos';
import { IFinancialBankAccountRepository } from '../repositories/ifinancial-bank-account.repository';
import { FINANCIAL_BANK_ACCOUNT_REPOSITORY } from '../repositories/financial-bank-account.tokens';
import { FinancialBankAccount } from '@prisma/client';
import { ConflictError } from '@shared/errors/app-error';

@injectable()
export class UpdateFinancialBankAccountUseCase {
  constructor(
    @inject(FINANCIAL_BANK_ACCOUNT_REPOSITORY)
    private readonly financialBankAccountRepository: IFinancialBankAccountRepository
  ) {}

  async execute(id: string, input: UpdateFinancialBankAccountDto): Promise<FinancialBankAccount> {
    const data: UpdateFinancialBankAccountDto = { ...input };

    if (input.name !== undefined) {
      const name = input.name.trim().toUpperCase();
      const existing = await this.financialBankAccountRepository.findByName(name);

      if (existing && existing.id !== id) {
        throw new ConflictError('FinancialBankAccount name already exists!');
      }

      data.name = name;
    }

    return await this.financialBankAccountRepository.update(id, data);
  }
}
