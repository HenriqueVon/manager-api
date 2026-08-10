import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialFundTransaction } from '@prisma/client';
import { IFinancialFundTransactionRepository } from './ifinancial-fund-transaction.repository';
import { CreateFinancialFundTransactionDto, UpdateFinancialFundTransactionDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialFundTransactionRepository implements IFinancialFundTransactionRepository {
  async create(data: CreateFinancialFundTransactionDto): Promise<FinancialFundTransaction> {
    return prismaCall(() => prisma.financialFundTransaction.create({ data }));
  }

  async findById(id: string): Promise<FinancialFundTransaction | null> {
    return prisma.financialFundTransaction.findUnique({
      where: { id },
    });
  }
  async findMany(
    filters: Partial<FinancialFundTransaction> = {},
    params: ListParamsDto = {}
  ): Promise<PaginatedResponseDto<FinancialFundTransaction>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { transactionDate, amountCredit, amountDebit, additionalDescription, ledgerId, financialDescriptionId, financialFundId, financialCategoryId, financialBankAccountId } = filters;

    const orderBy = params.orderBy
      ? {
        [params.orderBy]: params.orderDirection ?? 'asc',
      }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.financialFundTransaction.findMany({
        where : { transactionDate, amountCredit, amountDebit, additionalDescription, ledgerId, financialDescriptionId, financialFundId, financialCategoryId, financialBankAccountId },
        skip  : offset,
        take  : limit,
        orderBy,
      }),
      prisma.financialFundTransaction.count({
        where: { transactionDate, amountCredit, amountDebit, additionalDescription, ledgerId, financialDescriptionId, financialFundId, financialCategoryId, financialBankAccountId },
      }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateFinancialFundTransactionDto): Promise<FinancialFundTransaction> {
    return prismaCall(() =>
      prisma.financialFundTransaction.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialFundTransaction.delete({ where: { id } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialFundTransaction.count({ where: { id } });
    return count > 0;
  }
}
