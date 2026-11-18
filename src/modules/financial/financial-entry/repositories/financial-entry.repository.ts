import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialEntry, FinancialEntryType, Prisma } from '@prisma/client';
import { IFinancialEntryRepository } from './ifinancial-entry.repository';
import {
  CreateFinancialEntryDto,
  UpdateFinancialEntryDto,
  FinancialEntryPaymentResultDto,
  FinancialEntrySummaryFiltersDto,
  FinancialEntrySummaryGroupDto,
  FinancialEntrySummaryMonthDto,
  FinancialEntrySummaryCategoryDto,
  FinancialEntryAgingBand,
  FinancialEntryAgingGroupDto
} from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { DateRangeDto } from '@shared/dtos/date-range.dto';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';
import { ResourcesAlreadyPaidError } from '@shared/errors/app-error';

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

  async summarize(filters: FinancialEntrySummaryFiltersDto, dueDateRange: DateRangeDto = {}): Promise<FinancialEntrySummaryGroupDto[]> {
    const byFund = await prisma.financialEntry.groupBy({
      by     : ['financialFundId', 'type'],
      where  : this.summaryWhere(filters, { gte: dueDateRange.from, lte: dueDateRange.to }),
      _count : { _all: true },
      _sum   : { amount: true, amountPaid: true },
    });

    const currencyOfFund = await this.currencyOfFunds(byFund.map((group) => group.financialFundId));

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

  async summarizeByMonth(filters: FinancialEntrySummaryFiltersDto, dueDateRange: DateRangeDto = {}): Promise<FinancialEntrySummaryMonthDto[]> {
    // The dates are stored at midnight UTC: grouping by date and folding the days into months keeps the query free of raw SQL
    const byDay = await prisma.financialEntry.groupBy({
      by     : ['dueDate', 'financialFundId', 'type'],
      where  : this.summaryWhere(filters, { gte: dueDateRange.from, lte: dueDateRange.to }),
      _count : { _all: true },
      _sum   : { amount: true, amountPaid: true },
    });

    const currencyOfFund = await this.currencyOfFunds(byDay.map((row) => row.financialFundId));
    const groups = new Map<string, FinancialEntrySummaryMonthDto>();

    for (const row of byDay) {
      const month = row.dueDate.toISOString().slice(0, 7);
      const financialCurrencyId = currencyOfFund.get(row.financialFundId) as string;
      const key = `${month}:${row.type}:${financialCurrencyId}`;
      const group = groups.get(key) ?? { month, ...this.emptyGroup(row.type, financialCurrencyId) };

      this.addTotals(group, row);
      groups.set(key, group);
    }

    return [...groups.values()].sort((a, b) => a.month.localeCompare(b.month) || a.type.localeCompare(b.type) || a.financialCurrencyId.localeCompare(b.financialCurrencyId));
  }

  async summarizeByCategory(filters: FinancialEntrySummaryFiltersDto, dueDateRange: DateRangeDto = {}): Promise<FinancialEntrySummaryCategoryDto[]> {
    const byCategory = await prisma.financialEntry.groupBy({
      by     : ['financialCategoryId', 'financialFundId', 'type'],
      where  : this.summaryWhere(filters, { gte: dueDateRange.from, lte: dueDateRange.to }),
      _count : { _all: true },
      _sum   : { amount: true, amountPaid: true },
    });

    const currencyOfFund = await this.currencyOfFunds(byCategory.map((row) => row.financialFundId));
    const groups = new Map<string, FinancialEntrySummaryCategoryDto>();

    for (const row of byCategory) {
      const financialCurrencyId = currencyOfFund.get(row.financialFundId) as string;
      const key = `${row.financialCategoryId}:${row.type}:${financialCurrencyId}`;
      const group = groups.get(key) ?? { financialCategoryId: row.financialCategoryId, ...this.emptyGroup(row.type, financialCurrencyId) };

      this.addTotals(group, row);
      groups.set(key, group);
    }

    return [...groups.values()].sort((a, b) => a.type.localeCompare(b.type) || a.financialCurrencyId.localeCompare(b.financialCurrencyId) || a.financialCategoryId.localeCompare(b.financialCategoryId));
  }

  async summarizeAging(filters: { ledgerId?: string; type?: FinancialEntryType }, today: Date): Promise<FinancialEntryAgingGroupDto[]> {
    const dayInMs = 24 * 60 * 60 * 1000;
    const inDays = (days: number) => new Date(today.getTime() + days * dayInMs);

    // From the most urgent to the least; the order of the keys is the order of the result
    const dueDateOfBand: Record<FinancialEntryAgingBand, Prisma.DateTimeFilter> = {
      OVERDUE    : { lt: today },
      DAYS_0_7   : { gte: today, lte: inDays(7) },
      DAYS_8_30  : { gte: inDays(8), lte: inDays(30) },
      DAYS_31_90 : { gte: inDays(31), lte: inDays(90) },
      OVER_90    : { gte: inDays(91) },
    };
    const bands = Object.keys(dueDateOfBand) as FinancialEntryAgingBand[];

    const byBand = await Promise.all(bands.map(async (band) => ({
      band,
      rows: await prisma.financialEntry.groupBy({
        by     : ['financialFundId', 'type'],
        where  : this.summaryWhere({ ...filters, paid: false }, dueDateOfBand[band]),
        _count : { _all: true },
        _sum   : { amount: true, amountPaid: true },
      }),
    })));

    const currencyOfFund = await this.currencyOfFunds(byBand.flatMap(({ rows }) => rows.map((row) => row.financialFundId)));
    const groups = new Map<string, FinancialEntryAgingGroupDto>();

    for (const { band, rows } of byBand) {
      for (const row of rows) {
        const financialCurrencyId = currencyOfFund.get(row.financialFundId) as string;
        const key = `${band}:${row.type}:${financialCurrencyId}`;
        const group = groups.get(key) ?? { band, type: row.type, financialCurrencyId, count: 0, amountOpen: new Prisma.Decimal(0) };

        group.count += row._count._all;
        group.amountOpen = group.amountOpen.add(row._sum.amount ?? 0).sub(row._sum.amountPaid ?? 0);
        groups.set(key, group);
      }
    }

    return [...groups.values()].sort((a, b) => bands.indexOf(a.band) - bands.indexOf(b.band) || a.type.localeCompare(b.type) || a.financialCurrencyId.localeCompare(b.financialCurrencyId));
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

  async payMany(ids: string[]): Promise<FinancialEntryPaymentResultDto> {
    return prismaCall(() => prisma.$transaction(async (tx) => {
      const entries = await tx.financialEntry.findMany({
        where  : { id: { in: ids } },
        select : { id: true, dueDate: true, amount: true, paymentDate: true },
      });

      const found = new Set(entries.map((entry) => entry.id));
      const missingIds = ids.filter((id) => !found.has(id));
      const paidIds = entries.filter((entry) => entry.paymentDate !== null).map((entry) => entry.id);

      if (missingIds.length > 0 || paidIds.length > 0) {
        return { missingIds, paidIds };
      }

      for (const entry of entries) {
        // The condition repeats the check above: an entry paid by someone else after the read is not overwritten,
        // and the error undoes the whole transaction.
        const { count } = await tx.financialEntry.updateMany({
          where : { id: entry.id, paymentDate: null },
          data  : { paymentDate: entry.dueDate, amountPaid: entry.amount },
        });

        if (count !== 1) {
          throw new ResourcesAlreadyPaidError([entry.id]);
        }
      }

      return { missingIds: [], paidIds: [] };
    }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialEntry.count({ where: { id } });
    return count > 0;
  }

  // `paid` follows the payment date: with one the entry is paid, without it the entry is open
  private summaryWhere({ ledgerId, type, ids, paid }: FinancialEntrySummaryFiltersDto, dueDate: Prisma.DateTimeFilter): Prisma.FinancialEntryWhereInput {
    const paymentDate = paid === undefined ? undefined : (paid ? { not: null } : null);

    return { ledgerId, type, id: ids && { in: ids }, paymentDate, dueDate };
  }

  // The currency of an entry is the one of its fund
  private async currencyOfFunds(fundIds: string[]): Promise<Map<string, string>> {
    const funds = await prisma.financialFund.findMany({
      where  : { id: { in: [...new Set(fundIds)] } },
      select : { id: true, financialCurrencyId: true },
    });

    return new Map(funds.map((fund) => [fund.id, fund.financialCurrencyId]));
  }

  private emptyGroup(type: FinancialEntryType, financialCurrencyId: string): FinancialEntrySummaryGroupDto {
    return { type, financialCurrencyId, count: 0, amount: new Prisma.Decimal(0), amountPaid: new Prisma.Decimal(0) };
  }

  private addTotals(
    group: FinancialEntrySummaryGroupDto,
    row: { _count: { _all: number }; _sum: { amount: Prisma.Decimal | null; amountPaid: Prisma.Decimal | null } }
  ): void {
    group.count += row._count._all;
    group.amount = group.amount.add(row._sum.amount ?? 0);
    group.amountPaid = group.amountPaid.add(row._sum.amountPaid ?? 0);
  }
}
