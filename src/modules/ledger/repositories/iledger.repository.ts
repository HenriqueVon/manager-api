import { Ledger } from '@prisma/client';
import { CreateLedgerDto, UpdateLedgerDto } from '../dtos';

export interface ILedgerRepository {
  create(data: CreateLedgerDto): Promise<Ledger>;
  findById(id: string): Promise<Ledger | null>;
  findMany(filters?: Partial<Ledger>): Promise<Ledger[]>;
  update(id: string, data: UpdateLedgerDto): Promise<Ledger>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
