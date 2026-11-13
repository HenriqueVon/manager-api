import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialFundTransaction, Prisma } from '@prisma/client';
import { IFinancialFundTransactionRepository } from './ifinancial-fund-transaction.repository';
import { CreateFinancialFundTransactionDto, UpdateFinancialFundTransactionDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { DateRangeDto } from '@shared/dtos/date-range.dto';
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
    params: ListParamsDto = {},
    transactionDateRange: DateRangeDto = {}
  ): Promise<PaginatedResponseDto<FinancialFundTransaction>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;

    const { transactionDate, amountCredit, amountDebit, additionalDescription, ledgerId, financialDescriptionId, financialFundId, financialCategoryId, financialBankAccountId } = filters;

    // An exact transactionDate wins over the range; a range with no ends matches every date
    const where: Prisma.FinancialFundTransactionWhereInput = {
      transactionDate: transactionDate ?? { gte: transactionDateRange.from, lte: transactionDateRange.to },
      amountCredit, amountDebit, additionalDescription, ledgerId, financialDescriptionId, financialFundId, financialCategoryId, financialBankAccountId,
    };

    // Without an order the database may repeat or skip rows between pages, and many transactions share a date.
    // The id breaks ties, so the order is always total.
    const sortBy = params.orderBy ?? 'transactionDate';
    const orderBy: Array<Record<string, 'asc' | 'desc'>> = [
      { [sortBy]: params.orderDirection ?? 'asc' },
    ];

    if (sortBy !== 'id') {
      orderBy.push({ id: 'asc' });
    }

    const [items, total] = await Promise.all([
      prisma.financialFundTransaction.findMany({
        where,
        skip : offset,
        take : limit,
        orderBy,
      }),
      prisma.financialFundTransaction.count({ where }),
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
