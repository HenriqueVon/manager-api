import { z } from 'zod';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { listFinancialDescriptionQuerySchema } from '../schemas/list-financial-description-query.schema';

export type ListFinancialDescriptionQueryDto = z.infer<typeof listFinancialDescriptionQuerySchema>;

// The filters of the list query: everything but pagination and order
export type ListFinancialDescriptionFiltersDto = Omit<ListFinancialDescriptionQueryDto, keyof ListParamsDto>;
