import { z } from 'zod';
import { exchangeCodeSchema } from '../schemas/exchange-code.schema';

export type ExchangeCodeDto = z.infer<typeof exchangeCodeSchema>;
