import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialEntry, FinancialEntryType, Prisma } from '@prisma/client';
import { IFinancialEntryRepository } from './ifinancial-entry.repository';
import { CreateFinancialEntryDto, UpdateFinancialEntryDto, FinancialEntrySummaryGroupDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { DateRangeDto } from '@shared/dtos/date-range.dto';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialEntryRepository implements IFinancialEntryRepository {
  async create(data: CreateFinancialEntryDto): Promise<FinancialEntry> {
    return prismaCall(() => prisma.financialEntry.create({ data }));
  }

  async createMany(data: CreateFinancialEntryDto[]): Promise<FinancialEntry[]> {
    return prismaCall(() => prisma.$transaction(
      data.map((entry) => prisma.financialEntry.create({ data: entry }))
    ));
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

  async summarize(
    { ledgerId, type, ids }: { ledgerId?: string; type?: FinancialEntryType; ids?: string[] },
    dueDateRange: DateRangeDto = {}
  ): Promise<FinancialEntrySummaryGroupDto[]> {
    const where: Prisma.FinancialEntryWhereInput = {
      ledgerId,
      type,
      id      : ids && { in: ids },
      dueDate : { gte: dueDateRange.from, lte: dueDateRange.to },
    };

    const byFund = await prisma.financialEntry.groupBy({
      by     : ['financialFundId', 'type'],
      where,
      _count : { _all: true },
      _sum   : { amount: true, amountPaid: true },
    });

    // The currency of an entry is the one of its fund
    const funds = await prisma.financialFund.findMany({
      where  : { id: { in: byFund.map((group) => group.financialFundId) } },
      select : { id: true, financialCurrencyId: true },
    });
    const currencyOfFund = new Map(funds.map((fund) => [fund.id, fund.financialCurrencyId]));

    const groups = new Map<string, FinancialEntrySummaryGroupDto>();

    for (const row of byFund) {
      const financialCurrencyId = currencyOfFund.get(row.financialFundId) as string;
      const key = `${row.type}:${financialCurrencyId}`;
      const group = groups.get(key) ?? {
        type       : row.type,
        financialCurrencyId,
        count      : 0,
        amount     : new Prisma.Decimal(0),
        amountPaid : new Prisma.Decimal(0),
      };

      group.count += row._count._all;
      group.amount = group.amount.add(row._sum.amount ?? 0);
      group.amountPaid = group.amountPaid.add(row._sum.amountPaid ?? 0);
      groups.set(key, group);
    }

    return [...groups.values()].sort((a, b) => a.type.localeCompare(b.type) || a.financialCurrencyId.localeCompare(b.financialCurrencyId));
  }

  async findExistingIds(ids: string[]): Promise<string[]> {
    const entries = await prisma.financialEntry.findMany({
      where  : { id: { in: ids } },
      select : { id: true },
    });

    return entries.map((entry) => entry.id);
  }

  async deleteMany(ids: string[]): Promise<void> {
    await prismaCall(() => prisma.financialEntry.deleteMany({ where: { id: { in: ids } } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialEntry.count({ where: { id } });
    return count > 0;
  }
}
