import { FinancialEntry } from '@prisma/client';
import { CreateFinancialEntryDto, UpdateFinancialEntryDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialEntryRepository {
  create(data: CreateFinancialEntryDto): Promise<FinancialEntry>;
  findById(id: string): Promise<FinancialEntry | null>;
  findMany(filters?: Partial<FinancialEntry>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialEntry>>;
  update(id: string, data: UpdateFinancialEntryDto): Promise<FinancialEntry>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
