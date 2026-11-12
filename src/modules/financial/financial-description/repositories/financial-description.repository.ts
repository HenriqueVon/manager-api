import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialDescription, Prisma } from '@prisma/client';
import { IFinancialDescriptionRepository } from './ifinancial-description.repository';
import { CreateFinancialDescriptionDto, UpdateFinancialDescriptionDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialDescriptionRepository implements IFinancialDescriptionRepository {
  async create(data: CreateFinancialDescriptionDto): Promise<FinancialDescription> {
    return prismaCall(() => prisma.financialDescription.create({ data }));
  }

  async findById(id: string): Promise<FinancialDescription | null> {
    return prisma.financialDescription.findUnique({
      where: { id },
    });
  }
  async findByDescription(description: NonNullable<FinancialDescription['description']>): Promise<FinancialDescription | null> {
    return prisma.financialDescription.findUnique({
      where: { description },
    });
  }

  async findMany(
    filters: Partial<FinancialDescription> = {},
    params: ListParamsDto = {},
    search?: string
  ): Promise<PaginatedResponseDto<FinancialDescription>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { description } = filters;

    const where: Prisma.FinancialDescriptionWhereInput = { description };

    // Every word of the term must be in one of the searchable fields.
    // A field stored in one case is searched with the word in that case; the others ignore case.
    if (search) {
      where.AND = search.split(/\s+/).map((word): Prisma.FinancialDescriptionWhereInput => ({
        OR: [
          { description: { contains: word.toUpperCase() } },
        ],
      }));
    }

    // Without an order the database may repeat or skip rows between pages.
    // The id breaks ties, so the order is always total.
    const sortBy = params.orderBy ?? 'description';
    const orderBy: Array<Record<string, 'asc' | 'desc'>> = [
      { [sortBy]: params.orderDirection ?? 'asc' },
    ];

    if (sortBy !== 'id') {
      orderBy.push({ id: 'asc' });
    }

    const [items, total] = await Promise.all([
      prisma.financialDescription.findMany({
        where,
        skip : offset,
        take : limit,
        orderBy,
      }),
      prisma.financialDescription.count({ where }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateFinancialDescriptionDto): Promise<FinancialDescription> {
    return prismaCall(() =>
      prisma.financialDescription.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialDescription.delete({ where: { id } }));
  }
}
