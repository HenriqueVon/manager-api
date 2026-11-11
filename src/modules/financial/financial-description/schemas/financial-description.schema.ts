import { z } from 'zod';
import { dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialDescription` model as serialized to JSON
export const financialDescriptionSchema = z.object({
  id          : z.string(),
  description : z.string(),
  createdAt   : dateTimeString,
  updatedAt   : dateTimeString,
}).openapi('FinancialDescription');
