import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from '@config/env';

// `max` limits the connections of this process. In Lambda every container has its own pool, so the total
// is `max` times the number of containers running at once.
const adapter = new PrismaPg({
  connectionString : process.env.DATABASE_URL,
  max              : env.db.poolMax,
});

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
