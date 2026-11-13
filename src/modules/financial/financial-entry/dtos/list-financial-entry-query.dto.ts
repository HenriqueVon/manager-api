import { z } from 'zod';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { listFinancialEntryQuerySchema } from '../schemas/list-financial-entry-query.schema';

export type ListFinancialEntryQueryDto = z.infer<typeof listFinancialEntryQuerySchema>;

// The filters of the list query: everything but pagination and order
export type ListFinancialEntryFiltersDto = Omit<ListFinancialEntryQueryDto, keyof ListParamsDto>;
