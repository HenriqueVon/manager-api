import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialPaymentMethod } from '@prisma/client';
import { IFinancialPaymentMethodRepository } from './ifinancial-payment-method.repository';
import { CreateFinancialPaymentMethodDto, UpdateFinancialPaymentMethodDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

@injectable()
export class FinancialPaymentMethodRepository implements IFinancialPaymentMethodRepository {
  async create(data: CreateFinancialPaymentMethodDto): Promise<FinancialPaymentMethod> {
    return prismaCall(() => prisma.financialPaymentMethod.create({ data }));
  }

  async findById(id: string): Promise<FinancialPaymentMethod | null> {
    return prisma.financialPaymentMethod.findUnique({
      where: { id },
    });
  }
  async findByName(name: string): Promise<FinancialPaymentMethod | null> {
    return prisma.financialPaymentMethod.findUnique({
      where: { name },
    });
  }

  async findMany(
    filters: Partial<FinancialPaymentMethod> = {},
    params: ListParamsDto = {}
  ): Promise<PaginatedResponseDto<FinancialPaymentMethod>> {
    const limit = Math.min(params.limit ?? 20, 100);
    const offset = params.offset ?? 0;    

    const { name } = filters;

    const orderBy = params.orderBy
      ? {
        [params.orderBy]: params.orderDirection ?? 'asc',
      }
      : undefined;

    const [items, total] = await Promise.all([
      prisma.financialPaymentMethod.findMany({
        where : { name },
        skip  : offset,
        take  : limit,
        orderBy,
      }),
      prisma.financialPaymentMethod.count({
        where: { name },
      }),
    ]);

    return {
      items,
      total,
    };    
  }

  async update(id: string, data: UpdateFinancialPaymentMethodDto): Promise<FinancialPaymentMethod> {
    return prismaCall(() =>
      prisma.financialPaymentMethod.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialPaymentMethod.delete({ where: { id } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialPaymentMethod.count({ where: { id } });
    return count > 0;
  }
}
