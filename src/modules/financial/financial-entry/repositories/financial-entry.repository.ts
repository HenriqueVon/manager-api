import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialEntry, Prisma } from '@prisma/client';
import { IFinancialEntryRepository } from './ifinancial-entry.repository';
import { CreateFinancialEntryDto, UpdateFinancialEntryDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { DateRangeDto } from '@shared/dtos/date-range.dto';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialEntryRepository implements IFinancialEntryRepository {
  async create(data: CreateFinancialEntryDto): Promise<FinancialEntry> {
    return prismaCall(() => prisma.financialEntry.create({ data }));
  }

  async findById(id: string): Promise<FinancialEntry | null> {
    return prisma.financialEntry.findUnique({
      where: { id },
    });
  }
  async findMany(
    filters: Partial<FinancialEntry> = {},
    params: ListParamsDto = {},
    dueDateRange: DateRangeDto = {}
  ): Promise<PaginatedResponseDto<FinancialEntry>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;

    const { type, dueDate, paymentDate, amount, amountPaid, additionalDescription, isMonthly, ledgerId, financialDescriptionId, financialFundId, financialCategoryId } = filters;

    // An exact dueDate wins over the range; a range with no ends matches every date
    const where: Prisma.FinancialEntryWhereInput = {
      type,
      dueDate: dueDate ?? { gte: dueDateRange.from, lte: dueDateRange.to },
      paymentDate, amount, amountPaid, additionalDescription, isMonthly, ledgerId, financialDescriptionId, financialFundId, financialCategoryId,
    };

    // Without an order the database may repeat or skip rows between pages, and many entries share a date.
    // The id breaks ties, so the order is always total.
    const sortBy = params.orderBy ?? 'dueDate';
    const orderBy: Array<Record<string, 'asc' | 'desc'>> = [
      { [sortBy]: params.orderDirection ?? 'asc' },
    ];

    if (sortBy !== 'id') {
      orderBy.push({ id: 'asc' });
    }

    const [items, total] = await Promise.all([
      prisma.financialEntry.findMany({
        where,
        skip : offset,
        take : limit,
        orderBy,
      }),
      prisma.financialEntry.count({ where }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateFinancialEntryDto): Promise<FinancialEntry> {
    return prismaCall(() =>
      prisma.financialEntry.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialEntry.delete({ where: { id } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialEntry.count({ where: { id } });
    return count > 0;
  }
}
