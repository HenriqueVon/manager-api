import { z } from 'zod';
import { ListParamsDto } from '@shared/dtos/list-params.dto';
import { listLedgerQuerySchema } from '../schemas/list-ledger-query.schema';

export type ListLedgerQueryDto = z.infer<typeof listLedgerQuerySchema>;

// The filters of the list query: everything but pagination and order
export type ListLedgerFiltersDto = Omit<ListLedgerQueryDto, keyof ListParamsDto>;
