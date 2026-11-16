import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialCategory, Prisma } from '@prisma/client';
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
    params: ListParamsDto = {},
    search?: string
  ): Promise<PaginatedResponseDto<FinancialCategory>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { name, type, balance, ledgerId, parentCategoryId } = filters;

    const where: Prisma.FinancialCategoryWhereInput = { name, type, balance, ledgerId, parentCategoryId };

    // Every word of the term must be in one of the searchable fields.
    // A field stored in one case is searched with the word in that case; the others ignore case.
    if (search) {
      where.AND = search.split(/\s+/).map((word): Prisma.FinancialCategoryWhereInput => ({
        OR: [
          { name: { contains: word.toUpperCase() } },
        ],
      }));
    }

    // Without an order the database may repeat or skip rows between pages.
    // The id breaks ties, so the order is always total.
    const sortBy = params.orderBy ?? 'name';
    const orderBy: Array<Record<string, 'asc' | 'desc'>> = [
      { [sortBy]: params.orderDirection ?? 'asc' },
    ];

    if (sortBy !== 'id') {
      orderBy.push({ id: 'asc' });
    }

    const [items, total] = await Promise.all([
      prisma.financialCategory.findMany({
        where,
        skip : offset,
        take : limit,
        orderBy,
      }),
      prisma.financialCategory.count({ where }),
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
}
