import { FinancialFund } from '@prisma/client';
import { CreateFinancialFundDto, UpdateFinancialFundDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialFundRepository {
  create(data: CreateFinancialFundDto): Promise<FinancialFund>;
  findById(id: string): Promise<FinancialFund | null>;
  findByName(name: string): Promise<FinancialFund | null>;
  findMany(filters?: Partial<FinancialFund>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialFund>>;
  update(id: string, data: UpdateFinancialFundDto): Promise<FinancialFund>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
