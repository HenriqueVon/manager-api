import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { Ledger } from '@prisma/client';
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

  async findById(id: string) : Promise<Ledger | null> {
    return prisma.ledger.findUnique({
      where: { id },
    });
  } 

  async findByName(name: string) : Promise<Ledger | null> {
    return prisma.ledger.findUnique ({ 
      where: { name }
    });
  }

  async findMany(
    filters: Partial<Ledger> = {},
    params: ListParamsDto = {}
  ): Promise<PaginatedResponseDto<Ledger>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { name, type } = filters;

    const orderBy = params.orderBy
      ? {
        [params.orderBy]: params.orderDirection ?? 'asc',
      }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.ledger.findMany({
        where : { name, type },
        skip  : offset,
        take  : limit,
        orderBy,
      }),
      prisma.ledger.count({
        where: { name, type },
      }),
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

  async exists(id: string): Promise<boolean> {
    const count = await prisma.ledger.count({ where: { id } });
    return count > 0;
  }
}