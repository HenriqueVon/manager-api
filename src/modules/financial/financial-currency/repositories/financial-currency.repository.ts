import { injectable } from 'tsyringe';
import { prisma } from '@services/database/prisma/prisma.client';
import { FinancialCurrency } from '@prisma/client';
import { IFinancialCurrencyRepository } from './ifinancial-currency.repository';
import { CreateFinancialCurrencyDto, UpdateFinancialCurrencyDto } from '../dtos';
import { prismaCall } from '@shared/database/prisma/prisma-call';

@injectable()
export class FinancialCurrencyRepository implements IFinancialCurrencyRepository {
  async create(data: CreateFinancialCurrencyDto): Promise<FinancialCurrency> {
    return prismaCall(() => prisma.financialCurrency.create({ data }));
  }

  async findById(id: string): Promise<FinancialCurrency | null> {
    return prisma.financialCurrency.findUnique({
      where: { id },
    });
  }
  async findByName(name: string): Promise<FinancialCurrency | null> {
    return prisma.financialCurrency.findUnique({
      where: { name },
    });
  }

  async findMany(filters: Partial<FinancialCurrency> = {}): Promise<FinancialCurrency[]> {
    const { name, symbol } = filters;

    return prisma.financialCurrency.findMany({
      where: { name, symbol },
    });
  }

  async update(id: string, data: UpdateFinancialCurrencyDto): Promise<FinancialCurrency> {
    return prismaCall(() =>
      prisma.financialCurrency.update({
        where: { id },
        data,
      })
    );
  }

  async delete(id: string): Promise<void> {
    await prismaCall(() => prisma.financialCurrency.delete({ where: { id } }));
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.financialCurrency.count({ where: { id } });
    return count > 0;
  }
}
