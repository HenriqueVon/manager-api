import { FinancialBankAccount } from '@prisma/client';
import { CreateFinancialBankAccountDto, UpdateFinancialBankAccountDto } from '../dtos';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialBankAccountRepository {
  create(data: CreateFinancialBankAccountDto): Promise<FinancialBankAccount>;
  findById(id: string): Promise<FinancialBankAccount | null>;
  findByName(name: string): Promise<FinancialBankAccount | null>;
  findMany(filters?: Partial<FinancialBankAccount>, params?: ListParamsDto): Promise<PaginatedResponseDto<FinancialBankAccount>>;
  update(id: string, data: UpdateFinancialBankAccountDto): Promise<FinancialBankAccount>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
