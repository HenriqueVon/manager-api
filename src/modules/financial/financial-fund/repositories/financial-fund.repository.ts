import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialFund } from '@prisma/client';
import { IFinancialFundRepository } from './ifinancial-fund.repository';
import { CreateFinancialFundDto, UpdateFinancialFundDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialFundRepository implements IFinancialFundRepository {
  async create(data: CreateFinancialFundDto): Promise<FinancialFund> {
    return prismaCall(() => prisma.financialFund.create({ data }));
  }

  async findById(id: string): Promise<FinancialFund | null> {
    return prisma.financialFund.findUnique({
      where: { id },
    });
  }

  async findMany(
    filters: Partial<FinancialFund> = {},
    params: ListParamsDto = {}
  ): Promise<PaginatedResponseDto<FinancialFund>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { name, balance, ledgerId, financialCurrencyId } = filters;

    const orderBy = params.orderBy
      ? {
        [params.orderBy]: params.orderDirection ?? 'asc',
      }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.financialFund.findMany({
        where : { name, balance, ledgerId, financialCurrencyId },
        skip  : offset,
        take  : limit,
        orderBy,
      }),
      prisma.financialFund.count({
        where: { name, balance, ledgerId, financialCurrencyId },
      }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateFinancialFundDto): Promise<FinancialFund> {
    return prismaCall(() =>
      prisma.financialFund.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialFund.delete({ where: { id } }));
  }

  async findExistingIds(ids: string[]): Promise<string[]> {
    const records = await prisma.financialFund.findMany({
      where  : { id: { in: ids } },
      select : { id: true },
    });

    return records.map((record) => record.id);
  }

  async findIdsInUse(ids: string[]): Promise<string[]> {
    const records = await prisma.financialFund.findMany({
      where: {
        id : { in: ids },
        OR : [
          { financialEntries: { some: {} } },
          { financialFundTransactions: { some: {} } },
        ],
      },
      select: { id: true },
    });

    return records.map((record) => record.id);
  }

  async deleteMany(ids: string[]): Promise<void> {
    await prismaCall(() => prisma.financialFund.deleteMany({ where: { id: { in: ids } } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialFund.count({ where: { id } });
    return count > 0;
  }
}
