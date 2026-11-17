import { FinancialDescription } from '@prisma/client';
import { CreateFinancialDescriptionDto, UpdateFinancialDescriptionDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialDescriptionRepository {
  create(data: CreateFinancialDescriptionDto): Promise<FinancialDescription>;
  findById(id: string): Promise<FinancialDescription | null>;
  findByDescription(description: NonNullable<FinancialDescription['description']>): Promise<FinancialDescription | null>;
  findMany(filters?: Partial<FinancialDescription>, params?: ListParamsDto, search?: string): Promise<PaginatedResponseDto<FinancialDescription>>;
  update(id: string, data: UpdateFinancialDescriptionDto): Promise<FinancialDescription>;
  delete(id: string): Promise<void>;
  // The ids, among the given ones, that exist
  findExistingIds(ids: string[]): Promise<string[]>;
  // The ids, among the given ones, that other records use
  findIdsInUse(ids: string[]): Promise<string[]>;
  // Deletes all the records with the given ids in a single statement
  deleteMany(ids: string[]): Promise<void>;
}
