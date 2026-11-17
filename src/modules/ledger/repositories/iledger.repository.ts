import { Ledger } from '@prisma/client';
import { CreateLedgerDto, UpdateLedgerDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface ILedgerRepository {
  create(data: CreateLedgerDto): Promise<Ledger>;
  findById(id: string): Promise<Ledger | null>;
  findByName(name: NonNullable<Ledger['name']>): Promise<Ledger | null>;
  findMany(filters?: Partial<Ledger>, params?: ListParamsDto, search?: string): Promise<PaginatedResponseDto<Ledger>>;
  update(id: string, data: UpdateLedgerDto): Promise<Ledger>;
  delete(id: string): Promise<void>;
  // The ids, among the given ones, that exist
  findExistingIds(ids: string[]): Promise<string[]>;
  // The ids, among the given ones, that other records use
  findIdsInUse(ids: string[]): Promise<string[]>;
  // Deletes all the records with the given ids in a single statement
  deleteMany(ids: string[]): Promise<void>;
}
