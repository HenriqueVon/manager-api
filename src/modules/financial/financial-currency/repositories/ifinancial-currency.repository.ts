import { FinancialCurrency } from '@prisma/client';
import { CreateFinancialCurrencyDto, UpdateFinancialCurrencyDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialCurrencyRepository {
  create(data: CreateFinancialCurrencyDto): Promise<FinancialCurrency>;
  findById(id: string): Promise<FinancialCurrency | null>;
  findByName(name: string): Promise<FinancialCurrency | null>;
  findMany(filters?: Partial<FinancialCurrency>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialCurrency>>;
  update(id: string, data: UpdateFinancialCurrencyDto): Promise<FinancialCurrency>;
  delete(id: string): Promise<void>;
  // The ids, among the given ones, that exist
  findExistingIds(ids: string[]): Promise<string[]>;
  // The ids, among the given ones, that other records use
  findIdsInUse(ids: string[]): Promise<string[]>;
  // Deletes all the records with the given ids in a single statement
  deleteMany(ids: string[]): Promise<void>;
  exists(id: string): Promise<boolean>;
}
