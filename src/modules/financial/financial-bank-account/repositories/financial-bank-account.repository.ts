import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialBankAccount } from '@prisma/client';
import { IFinancialBankAccountRepository } from './ifinancial-bank-account.repository';
import { CreateFinancialBankAccountDto, UpdateFinancialBankAccountDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialBankAccountRepository implements IFinancialBankAccountRepository {
  async create(data: CreateFinancialBankAccountDto): Promise<FinancialBankAccount> {
    return prismaCall(() => prisma.financialBankAccount.create({ data }));
  }

  async findById(id: string): Promise<FinancialBankAccount | null> {
    return prisma.financialBankAccount.findUnique({
      where: { id },
    });
  }
  async findByName(name: string): Promise<FinancialBankAccount | null> {
    return prisma.financialBankAccount.findUnique({
      where: { name },
    });
  }

  async findMany(
    filters: Partial<FinancialBankAccount> = {},
    params: ListParamsDto = {}
  ): Promise<PaginatedResponseDto<FinancialBankAccount>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { name, type, balance, ledgerId, financialCurrencyId } = filters;

    const orderBy = params.orderBy
      ? {
        [params.orderBy]: params.orderDirection ?? 'asc',
      }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.financialBankAccount.findMany({
        where : { name, type, balance, ledgerId, financialCurrencyId },
        skip  : offset,
        take  : limit,
        orderBy,
      }),
      prisma.financialBankAccount.count({
        where: { name, type, balance, ledgerId, financialCurrencyId },
      }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateFinancialBankAccountDto): Promise<FinancialBankAccount> {
    return prismaCall(() =>
      prisma.financialBankAccount.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialBankAccount.delete({ where: { id } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialBankAccount.count({ where: { id } });
    return count > 0;
  }
}
