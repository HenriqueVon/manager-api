import { LedgerType } from '@prisma/client';

export interface CreateLedgerDto {
  name: string;
  type: LedgerType
}