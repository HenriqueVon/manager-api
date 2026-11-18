import { FinancialEntry, FinancialEntryType } from '@prisma/client';
import {
  CreateFinancialEntryDto,
  UpdateFinancialEntryDto,
  FinancialEntryPaymentResultDto,
  FinancialEntrySummaryFiltersDto,
  FinancialEntrySummaryGroupDto,
  FinancialEntrySummaryMonthDto,
  FinancialEntrySummaryCategoryDto,
  FinancialEntryAgingGroupDto
} from '../dtos';
import { DateRangeDto } from '@shared/dtos/date-range.dto';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { PaginatedResponseDto } from '@shared/dtos/paginated-response.dto';

export interface IFinancialEntryRepository {
  create(data: CreateFinancialEntryDto): Promise<FinancialEntry>;
  // Creates all the entries or none of them
  createMany(data: CreateFinancialEntryDto[]): Promise<FinancialEntry[]>;
  findById(id: string): Promise<FinancialEntry | null>;
  // `search`: every word must be in the description or in the additionalDescription of the entry
  findMany(filters?: Partial<FinancialEntry>, params?: ListParamsDto, dueDateRange?: DateRangeDto, search?: string): Promise<PaginatedResponseDto<FinancialEntry>>;
  // The totals of the entries that match, grouped by type and currency; `ids` narrows them to the ones given
  summarize(filters: FinancialEntrySummaryFiltersDto, dueDateRange?: DateRangeDto): Promise<FinancialEntrySummaryGroupDto[]>;
  // The same totals, also grouped by the month of the due date
  summarizeByMonth(filters: FinancialEntrySummaryFiltersDto, dueDateRange?: DateRangeDto): Promise<FinancialEntrySummaryMonthDto[]>;
  // The same totals, also grouped by category
  summarizeByCategory(filters: FinancialEntrySummaryFiltersDto, dueDateRange?: DateRangeDto): Promise<FinancialEntrySummaryCategoryDto[]>;
  // What is still to pay or receive in the entries without a payment date, by distance from `today` to the due date
  summarizeAging(filters: { ledgerId?: string; type?: FinancialEntryType }, today: Date): Promise<FinancialEntryAgingGroupDto[]>;
  update(id: string, data: UpdateFinancialEntryDto): Promise<FinancialEntry>;
  delete(id: string): Promise<void>;
  // The ids, among the given ones, that exist
  findExistingIds(ids: string[]): Promise<string[]>;
  // Deletes all the records with the given ids in a single statement
  deleteMany(ids: string[]): Promise<void>;
  // Marks the entries as paid, in one transaction: the payment date becomes the due date and the amount paid the
  // amount. When some id does not exist or is already paid, nothing is changed and the result lists those ids.
  payMany(ids: string[]): Promise<FinancialEntryPaymentResultDto>;
  exists(id: string): Promise<boolean>;
}
