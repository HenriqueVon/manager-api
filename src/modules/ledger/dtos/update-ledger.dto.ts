import { LedgerType } from '@prisma/client';

export interface UpdateLedgerDto {
  name? : string
  type? : LedgerType
}