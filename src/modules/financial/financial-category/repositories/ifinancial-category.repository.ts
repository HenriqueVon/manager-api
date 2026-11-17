import { FinancialCategory } from '@prisma/client';
import { CreateFinancialCategoryDto, UpdateFinancialCategoryDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialCategoryRepository {
  create(data: CreateFinancialCategoryDto): Promise<FinancialCategory>;
  findById(id: string): Promise<FinancialCategory | null>;
  findMany(filters?: Partial<FinancialCategory>, params?: ListParamsDto, search?: string): Promise<PaginatedResponseDto<FinancialCategory>>;
  update(id: string, data: UpdateFinancialCategoryDto): Promise<FinancialCategory>;
  delete(id: string): Promise<void>;
  // The ids, among the given ones, that exist
  findExistingIds(ids: string[]): Promise<string[]>;
  // The ids, among the given ones, that other records use
  findIdsInUse(ids: string[]): Promise<string[]>;
  // Deletes all the records with the given ids in a single statement
  deleteMany(ids: string[]): Promise<void>;
}
