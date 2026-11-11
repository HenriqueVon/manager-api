import { z } from 'zod';
import { dateTimeString } from '@shared/schemas/output.schema';

// Response shape: the Prisma `FinancialPaymentMethod` model as serialized to JSON
export const financialPaymentMethodSchema = z.object({
  id        : z.string(),
  name      : z.string(),
  createdAt : dateTimeString,
  updatedAt : dateTimeString,
}).openapi('FinancialPaymentMethod');
