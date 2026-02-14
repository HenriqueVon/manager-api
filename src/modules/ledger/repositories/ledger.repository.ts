import { injectable } from 'tsyringe';
import { prisma } from './../../../services/database/prisma/prisma.client';
import { Ledger } from '@prisma/client';
import { ILedgerRepository } from './iledger.repository';
import { CreateLedgerDto, UpdateLedgerDto } from '../dtos';
import { prismaCall } from './../../../shared/database/prisma/prisma-call';

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

  async findMany(filters: Partial<Ledger> = {}): Promise<Ledger[]> {
    const { name, type } = filters;
    return prisma.ledger.findMany(
      { where: 
        {name, type}
      }
    );
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