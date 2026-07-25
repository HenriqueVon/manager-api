import { FinancialPaymentMethod } from '@prisma/client';
import { CreateFinancialPaymentMethodDto, UpdateFinancialPaymentMethodDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialPaymentMethodRepository {
  create(data: CreateFinancialPaymentMethodDto): Promise<FinancialPaymentMethod>;
  findById(id: string): Promise<FinancialPaymentMethod | null>;
  findByName(name: string): Promise<FinancialPaymentMethod | null>;
  findMany(filters?: Partial<FinancialPaymentMethod>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialPaymentMethod>>;
  update(id: string, data: UpdateFinancialPaymentMethodDto): Promise<FinancialPaymentMethod>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
