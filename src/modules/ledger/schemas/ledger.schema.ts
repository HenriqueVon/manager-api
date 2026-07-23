import { z } from 'zod';
import { createLedgerSchema } from './create-ledger.schema';

export const ledgerSchema = createLedgerSchema.extend({
  id        : z.string(),
  createdAt : z.string().datetime(),
  updatedAt : z.string().datetime(),
});
