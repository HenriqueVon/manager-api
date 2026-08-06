import { FinancialCategory } from '@prisma/client';
import { CreateFinancialCategoryDto, UpdateFinancialCategoryDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialCategoryRepository {
  create(data: CreateFinancialCategoryDto): Promise<FinancialCategory>;
  findById(id: string): Promise<FinancialCategory | null>;
  findMany(filters?: Partial<FinancialCategory>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialCategory>>;
  update(id: string, data: UpdateFinancialCategoryDto): Promise<FinancialCategory>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
