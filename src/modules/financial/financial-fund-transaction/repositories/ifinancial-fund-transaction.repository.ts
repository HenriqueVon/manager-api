import { FinancialFundTransaction } from '@prisma/client';
import { CreateFinancialFundTransactionDto, UpdateFinancialFundTransactionDto } from '../dtos';
import { DateRangeDto } from '@shared/dtos/date-range.dto';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialFundTransactionRepository {
  create(data: CreateFinancialFundTransactionDto): Promise<FinancialFundTransaction>;
  findById(id: string): Promise<FinancialFundTransaction | null>;
  findMany(filters?: Partial<FinancialFundTransaction>, params?: ListParamsDto, transactionDateRange?: DateRangeDto): Promise<PaginatedResponseDto<FinancialFundTransaction>>;
  update(id: string, data: UpdateFinancialFundTransactionDto): Promise<FinancialFundTransaction>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
