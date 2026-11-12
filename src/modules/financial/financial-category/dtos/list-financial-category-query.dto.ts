import { z } from 'zod';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { listFinancialCategoryQuerySchema } from '../schemas/list-financial-category-query.schema';

export type ListFinancialCategoryQueryDto = z.infer<typeof listFinancialCategoryQuerySchema>;

// The filters of the list query: everything but pagination and order
export type ListFinancialCategoryFiltersDto = Omit<ListFinancialCategoryQueryDto, keyof ListParamsDto>;
