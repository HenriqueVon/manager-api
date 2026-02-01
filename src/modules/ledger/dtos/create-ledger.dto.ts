import { z } from 'zod';
import { createLedgerSchema } from '../schemas/create-ledger.schema';
export type CreateLedgerDto = z.infer<typeof createLedgerSchema>;