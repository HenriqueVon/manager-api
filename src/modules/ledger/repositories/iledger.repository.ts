import { Ledger } from '@prisma/client';
import { CreateLedgerDto, UpdateLedgerDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';
export interface ILedgerRepository {
  create(data: CreateLedgerDto): Promise<Ledger>;
  findById(id: string): Promise<Ledger | null>;
  findByName(name: string): Promise<Ledger | null>;
  findMany(filters?: Partial<Ledger>, params?: ListParamsDto): Promise<PaginatedResponseDto<Ledger>>;
  update(id: string, data: UpdateLedgerDto): Promise<Ledger>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
