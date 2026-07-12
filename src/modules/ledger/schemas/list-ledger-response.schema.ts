import { paginatedResponseSchema } from '@shared/schemas/paginated-response.schema';
import { ledgerSchema } from './ledger.schema';

export const listLedgerResponseSchema =
  paginatedResponseSchema(ledgerSchema);
