import { z } from 'zod';
import { LedgerType } from '@prisma/client';
import { dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `Ledger` model as serialized to JSON
export const ledgerSchema = z.object({
  id        : z.string(),
  name      : z.string(),
  type      : z.enum(LedgerType),
  createdAt : dateTimeString,
  updatedAt : dateTimeString,
}).openapi('Ledger');
