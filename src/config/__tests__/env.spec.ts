import { describe, it, expect } from 'vitest';
import { parseEnv } from '../env';

const valid = {
  DATABASE_URL : 'postgresql://user:password@localhost:5432/db',
  API_KEY      : 'an-api-key',
  AUTH_API_URL : 'https://auth.example.com/v1/api',
  AUTH_API_KEY : 'an-auth-api-key',
};

describe('parseEnv', () => {
  it('should apply the defaults to the optional variables', () => {
    const env = parseEnv(valid);

    expect(env).toEqual({
      nodeEnv          : 'development',
      app              : { port: 3000 },
      db               : { url: valid.DATABASE_URL, poolMax: 2 },
      apiKey           : valid.API_KEY,
      docsEnabled      : false,
      authApiBaseUrl   : valid.AUTH_API_URL,
      authApiKey       : valid.AUTH_API_KEY,
      authClientSecret : undefined,
      authApiTimeoutMs : 5000,
    });
  });

  it('should convert the numbers and the boolean', () => {
    const env = parseEnv({
      ...valid,
      NODE_ENV            : 'production',
      PORT                : '4000',
      DB_POOL_MAX         : '5',
      DOCS_ENABLED        : 'true',
      AUTH_API_TIMEOUT_MS : '2000',
    });

    expect(env.nodeEnv).toBe('production');
    expect(env.app.port).toBe(4000);
    expect(env.db.poolMax).toBe(5);
    expect(env.docsEnabled).toBe(true);
    expect(env.authApiTimeoutMs).toBe(2000);
  });

  it('should keep the client secret when it is set', () => {
    expect(parseEnv({ ...valid, AUTH_CLIENT_SECRET: 'a-client-secret' }).authClientSecret).toBe('a-client-secret');
  });

  it('should treat an empty value as not set', () => {
    const env = parseEnv({ ...valid, PORT: '', DOCS_ENABLED: '', AUTH_CLIENT_SECRET: '', AUTH_API_TIMEOUT_MS: '' });

    expect(env.app.port).toBe(3000);
    expect(env.docsEnabled).toBe(false);
    expect(env.authClientSecret).toBeUndefined();
    expect(env.authApiTimeoutMs).toBe(5000);
  });

  it('should list every problem in one error', () => {
    expect(() => parseEnv({ NODE_ENV: 'staging', PORT: 'abc' })).toThrowError(
      /Invalid environment variables:[\s\S]*NODE_ENV[\s\S]*PORT[\s\S]*DATABASE_URL: is required[\s\S]*API_KEY: is required[\s\S]*AUTH_API_URL: is required[\s\S]*AUTH_API_KEY: is required/
    );
  });

  it('should reject a NODE_ENV outside the known values', () => {
    expect(() => parseEnv({ ...valid, NODE_ENV: 'staging' })).toThrowError(/NODE_ENV: must be development, test or production/);
  });

  it('should reject a DOCS_ENABLED that is not true or false', () => {
    expect(() => parseEnv({ ...valid, DOCS_ENABLED: 'yes' })).toThrowError(/DOCS_ENABLED: must be true or false/);
  });

  it('should reject a port, a pool size and a timeout out of range', () => {
    expect(() => parseEnv({ ...valid, PORT: '70000' })).toThrowError(/PORT/);
    expect(() => parseEnv({ ...valid, DB_POOL_MAX: '0' })).toThrowError(/DB_POOL_MAX/);
    expect(() => parseEnv({ ...valid, DB_POOL_MAX: '50' })).toThrowError(/DB_POOL_MAX/);
    expect(() => parseEnv({ ...valid, AUTH_API_TIMEOUT_MS: '0' })).toThrowError(/AUTH_API_TIMEOUT_MS/);
  });

  it('should require an http or https URL for the authentication API', () => {
    expect(() => parseEnv({ ...valid, AUTH_API_URL: 'not-a-url' })).toThrowError(/AUTH_API_URL: must be an http or https URL/);
    expect(() => parseEnv({ ...valid, AUTH_API_URL: 'ftp://auth.example.com' })).toThrowError(/AUTH_API_URL: must be an http or https URL/);
  });

  it('should never put the value of a variable in the error message', () => {
    const secret = 'secret-value-in-a-wrong-url';

    try {
      parseEnv({ ...valid, AUTH_API_URL: secret });
      expect.unreachable();
    } catch (error) {
      expect((error as Error).message).not.toContain(secret);
    }
  });
});
