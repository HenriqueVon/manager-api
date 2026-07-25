import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialDescription } from '@prisma/client';
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
  async findByDescription(description: string): Promise<FinancialDescription | null> {
    return prisma.financialDescription.findUnique({
      where: { description },
    });
  }

  async findMany(
    filters: Partial<FinancialDescription> = {},
    params: ListParamsDto = {}
  ): Promise<PaginatedResponseDto<FinancialDescription>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { description } = filters;

    const orderBy = params.orderBy
      ? {
        [params.orderBy]: params.orderDirection ?? 'asc',
      }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.financialDescription.findMany({
        where : { description },
        skip  : offset,
        take  : limit,
        orderBy,
      }),
      prisma.financialDescription.count({
        where: { description },
      }),
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

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialDescription.count({ where: { id } });
    return count > 0;
  }
}
