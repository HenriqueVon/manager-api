import { FinancialDescription } from '@prisma/client';
import { CreateFinancialDescriptionDto, UpdateFinancialDescriptionDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialDescriptionRepository {
  create(data: CreateFinancialDescriptionDto): Promise<FinancialDescription>;
  findById(id: string): Promise<FinancialDescription | null>;
  findByDescription(description: string): Promise<FinancialDescription | null>;
  findMany(filters?: Partial<FinancialDescription>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialDescription>>;
  update(id: string, data: UpdateFinancialDescriptionDto): Promise<FinancialDescription>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
