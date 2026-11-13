import { z } from 'zod';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { listFinancialFundTransactionQuerySchema } from '../schemas/list-financial-fund-transaction-query.schema';

export type ListFinancialFundTransactionQueryDto = z.infer<typeof listFinancialFundTransactionQuerySchema>;

// The filters of the list query: everything but pagination and order
export type ListFinancialFundTransactionFiltersDto = Omit<ListFinancialFundTransactionQueryDto, keyof ListParamsDto>;
