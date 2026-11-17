import { FinancialFund } from '@prisma/client';
import { CreateFinancialFundDto, UpdateFinancialFundDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialFundRepository {
  create(data: CreateFinancialFundDto): Promise<FinancialFund>;
  findById(id: string): Promise<FinancialFund | null>;
  findMany(filters?: Partial<FinancialFund>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialFund>>;
  update(id: string, data: UpdateFinancialFundDto): Promise<FinancialFund>;
  delete(id: string): Promise<void>;
  // The ids, among the given ones, that exist
  findExistingIds(ids: string[]): Promise<string[]>;
  // The ids, among the given ones, that other records use
  findIdsInUse(ids: string[]): Promise<string[]>;
  // Deletes all the records with the given ids in a single statement
  deleteMany(ids: string[]): Promise<void>;
  exists(id: string): Promise<boolean>;
}
