import { z } from 'zod';

export const listFinancialCategoryQuerySchema = z.object({
  limit          : z.coerce.number().int().min(1).max(100).optional().openapi({ description: 'Number of records per page, from 1 to 100. Default: 20.' }),
  offset         : z.coerce.number().int().min(0).optional().openapi({ type: 'integer', minimum: 0, description: 'Number of records to skip. Default: 0.' }),
  orderBy        : z.enum(['id', 'name']).optional().openapi({ description: 'Field to sort by. Default: name.' }),
  orderDirection : z.enum(['asc', 'desc']).optional().openapi({ description: 'Sort direction. Default: asc.' }),
  search         : z.string().trim().max(100, 'Search must have at most 100 characters').optional().openapi({ description: 'Returns the records where every word of the term is in name, ignoring case. Example: SUPERMARKET.' }),
  name           : z.string().optional().openapi({ description: 'Returns the records whose name equals the value. Example: SUPERMARKET.' }),
  ledgerId       : z.string().optional().openapi({ description: 'Returns the records whose ledgerId equals the value. Example: cm1234567890abcdefghijkl.' }),
}).strict();
