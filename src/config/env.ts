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

function poolMaxVar(): number {
  const n = numberVar('DB_POOL_MAX', 2);
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('Env var DB_POOL_MAX must be an integer from 1 to 20');
  return n;
}

export const env = {
  nodeEnv: (optional('NODE_ENV', 'development') as NodeEnv),
  
  app: {
    port: numberVar('PORT', 3000),
  },

  db: {
    url     : required('DATABASE_URL'),
    // Connections that the pool of one Lambda container may open. A container handles one request at a
    // time, so a small number is enough; many containers running together multiply it.
    poolMax : poolMaxVar(),
  },

  apiKey: required('API_KEY'),

  docsEnabled: optional('DOCS_ENABLED', 'false'),

  // Base URL of the authentication API, including /v1/api
  authApiBaseUrl: required('AUTH_API_URL'),

  // API key of the Client of this API in the authentication API
  authApiKey: required('AUTH_API_KEY'),

  // Only for a confidential Client: sent on the exchange of the social login code
  authClientSecret: optional('AUTH_CLIENT_SECRET'),

  authApiTimeoutMs: numberVar('AUTH_API_TIMEOUT_MS', 5000),

} as const;
