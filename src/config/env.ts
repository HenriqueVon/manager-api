import 'dotenv/config';

type NodeEnv = 'development' | 'test' | 'production';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

function numberVar(name: string, fallback?: number): number {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback === undefined) throw new Error(`Missing required env var: ${name}`);
    return fallback;
  }
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Env var ${name} must be a number`);
  return n;
}

export const env = {
  nodeEnv: (optional('NODE_ENV', 'development') as NodeEnv),
  
  app: {
    port: numberVar('PORT', 3000),
  },

  db: {
    url: required('DATABASE_URL'),
  },

} as const;
