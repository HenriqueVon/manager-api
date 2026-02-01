import { z } from 'zod';
import { updateLedgerSchema } from '../schemas/update-ledger.schema';
export type UpdateLedgerDto = z.infer<typeof updateLedgerSchema>;