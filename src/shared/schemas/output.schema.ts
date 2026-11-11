import { z } from 'zod';

// Prisma Decimal values are serialized to JSON as strings (e.g. "1000.5")
export const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/)
  .openapi({
    description : 'Decimal value serialized as a string',
    example     : '1000.5',
  });

// Prisma DateTime values are serialized to JSON as ISO 8601 date-time strings
export const dateTimeString = z.iso.datetime();
