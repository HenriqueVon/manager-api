import { FinancialEntry, FinancialEntryType } from '@prisma/client';
import { CreateFinancialEntryDto, UpdateFinancialEntryDto, FinancialEntrySummaryGroupDto } from '../dtos';
import { DateRangeDto } from '@shared/dtos/date-range.dto';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialEntryRepository {
  create(data: CreateFinancialEntryDto): Promise<FinancialEntry>;
  // Creates all the entries or none of them
  createMany(data: CreateFinancialEntryDto[]): Promise<FinancialEntry[]>;
  findById(id: string): Promise<FinancialEntry | null>;
  findMany(filters?: Partial<FinancialEntry>, params?: ListParamsDto, dueDateRange?: DateRangeDto): Promise<PaginatedResponseDto<FinancialEntry>>;
  // The totals of the entries that match, grouped by type and currency; `ids` narrows them to the ones given
  summarize(filters: { ledgerId?: string; type?: FinancialEntryType; ids?: string[] }, dueDateRange?: DateRangeDto): Promise<FinancialEntrySummaryGroupDto[]>;
  update(id: string, data: UpdateFinancialEntryDto): Promise<FinancialEntry>;
  delete(id: string): Promise<void>;
  // The ids, among the given ones, that exist
  findExistingIds(ids: string[]): Promise<string[]>;
  // Deletes all the records with the given ids in a single statement
  deleteMany(ids: string[]): Promise<void>;
  exists(id: string): Promise<boolean>;
}
