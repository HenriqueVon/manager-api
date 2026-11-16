import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { Ledger, Prisma } from '@prisma/client';
import { ILedgerRepository } from './iledger.repository';
import { CreateLedgerDto, UpdateLedgerDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class LedgerRepository implements ILedgerRepository {
  async create(data: CreateLedgerDto): Promise<Ledger> {
    return prismaCall(() => prisma.ledger.create({ data }));
  }

  async findById(id: string): Promise<Ledger | null> {
    return prisma.ledger.findUnique({
      where: { id },
    });
  }
  async findByName(name: NonNullable<Ledger['name']>): Promise<Ledger | null> {
    return prisma.ledger.findUnique({
      where: { name },
    });
  }

  async findMany(
    filters: Partial<Ledger> = {},
    params: ListParamsDto = {},
    search?: string
  ): Promise<PaginatedResponseDto<Ledger>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { name, type } = filters;

    const where: Prisma.LedgerWhereInput = { name, type };

    // Every word of the term must be in one of the searchable fields.
    // A field stored in one case is searched with the word in that case; the others ignore case.
    if (search) {
      where.AND = search.split(/\s+/).map((word): Prisma.LedgerWhereInput => ({
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
      prisma.ledger.findMany({
        where,
        skip : offset,
        take : limit,
        orderBy,
      }),
      prisma.ledger.count({ where }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateLedgerDto): Promise<Ledger> {
    return prismaCall(() =>
      prisma.ledger.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.ledger.delete({ where: { id } }));
  }
}
