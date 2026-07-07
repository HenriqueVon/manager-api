import { FinancialCurrency } from '@prisma/client';
import { CreateFinancialCurrencyDto, UpdateFinancialCurrencyDto } from '../dtos';

export interface IFinancialCurrencyRepository {
  create(data: CreateFinancialCurrencyDto): Promise<FinancialCurrency>;
  findById(id: string): Promise<FinancialCurrency | null>;
  findByName(name: string): Promise<FinancialCurrency | null>;
  findMany(filters?: Partial<FinancialCurrency>): Promise<FinancialCurrency[]>;
  update(id: string, data: UpdateFinancialCurrencyDto): Promise<FinancialCurrency>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
