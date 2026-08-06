import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialCategory } from '@prisma/client';
import { IFinancialCategoryRepository } from './ifinancial-category.repository';
import { CreateFinancialCategoryDto, UpdateFinancialCategoryDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialCategoryRepository implements IFinancialCategoryRepository {
  async create(data: CreateFinancialCategoryDto): Promise<FinancialCategory> {
    return prismaCall(() => prisma.financialCategory.create({ data }));
  }

  async findById(id: string): Promise<FinancialCategory | null> {
    return prisma.financialCategory.findUnique({
      where: { id },
    });
  }
  async findMany(
    filters: Partial<FinancialCategory> = {},
    params: ListParamsDto = {}
  ): Promise<PaginatedResponseDto<FinancialCategory>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { name, type, balance, ledgerId, parentCategoryId } = filters;

    const orderBy = params.orderBy
      ? {
        [params.orderBy]: params.orderDirection ?? 'asc',
      }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.financialCategory.findMany({
        where : { name, type, balance, ledgerId, parentCategoryId },
        skip  : offset,
        take  : limit,
        orderBy,
      }),
      prisma.financialCategory.count({
        where: { name, type, balance, ledgerId, parentCategoryId },
      }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateFinancialCategoryDto): Promise<FinancialCategory> {
    return prismaCall(() =>
      prisma.financialCategory.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialCategory.delete({ where: { id } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialCategory.count({ where: { id } });
    return count > 0;
  }
}
