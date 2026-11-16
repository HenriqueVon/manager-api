import '@docs/openapi/__tests__/test-env';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '@config/env';
import { AuthService } from '../auth.service';

const tokens = {
  accessToken  : 'access-token',
  tokenType    : 'Bearer',
  expiresIn    : 900,
  refreshToken : 'session.secret',
};

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers });
}

describe('AuthService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let sut: AuthService;

  function lastCall() {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return { url, init, headers: init.headers as Record<string, string> };
  }

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    sut = new AuthService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('authenticate', () => {
    it('should reject a missing Authorization header without calling the authentication API', async () => {
      await expect(sut.authenticate(undefined)).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each(['Basic abc', 'Bearer', 'abc'])('should reject the malformed header "%s"', async (header) => {
      await expect(sut.authenticate(header)).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should validate the token with POST /auth/validate, the API key and the bearer token', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, { authenticated: true }));

      await sut.authenticate('Bearer user-token');

      const { url, init, headers } = lastCall();
      expect(url).toBe(`${env.authApiBaseUrl}/auth/validate`);
      expect(init.method).toBe('POST');
      expect(headers['x-api-key']).toBe(env.authApiKey);
      expect(headers['Authorization']).toBe('Bearer user-token');
      expect(headers['x-client-secret']).toBeUndefined();
    });

    it.each([
      [401, 'AUTH_TOKEN_EXPIRED'],
      [401, 'AUTH_TOKEN_INVALID'],
      [401, 'AUTH_SESSION_REVOKED'],
      [403, 'MEMBERSHIP_NOT_FOUND'],
      [403, 'MEMBERSHIP_BLOCKED'],
      [403, 'CLIENT_DISABLED'],
    ])('should relay %s %s from the authentication API', async (status, code) => {
      fetchMock.mockResolvedValue(jsonResponse(status, { message: 'Refused', code }));

      await expect(sut.authenticate('Bearer user-token')).rejects.toMatchObject({
        name       : 'AppError',
        statusCode : status,
        code,
        message    : 'Refused',
      });
    });
  });

  describe('exchangeCode', () => {
    const input = { code: 'code-1', codeVerifier: 'v'.repeat(43), redirectUri: 'https://app.example.com/auth/callback' };

    it('should post the body and the device of the user and return the tokens', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, tokens));

      const result = await sut.exchangeCode(input, { ip: '198.51.100.7', userAgent: 'Mozilla/5.0' });

      const { url, init, headers } = lastCall();
      expect(result).toEqual(tokens);
      expect(url).toBe(`${env.authApiBaseUrl}/auth/exchange-code`);
      expect(JSON.parse(init.body as string)).toEqual(input);
      expect(headers['x-api-key']).toBe(env.authApiKey);
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['x-end-user-ip']).toBe('198.51.100.7');
      expect(headers['x-end-user-agent']).toBe('Mozilla/5.0');
    });

    it('should not send the device headers when the frontend reports none', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, tokens));

      await sut.exchangeCode(input, {});

      const { headers } = lastCall();
      expect(headers['x-end-user-ip']).toBeUndefined();
      expect(headers['x-end-user-agent']).toBeUndefined();
    });

    it('should send the client secret when one is configured', async () => {
      const mutableEnv = env as { authClientSecret?: string };
      mutableEnv.authClientSecret = 'client-secret';
      fetchMock.mockResolvedValue(jsonResponse(200, tokens));

      try {
        await sut.exchangeCode(input, {});
      } finally {
        mutableEnv.authClientSecret = undefined;
      }

      expect(lastCall().headers['x-client-secret']).toBe('client-secret');
    });

    it('should relay AUTH_CODE_INVALID', async () => {
      fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Invalid code', code: 'AUTH_CODE_INVALID' }));

      await expect(sut.exchangeCode(input, {})).rejects.toMatchObject({ statusCode: 401, code: 'AUTH_CODE_INVALID' });
    });
  });

  describe('refresh', () => {
    it('should post the refresh token and return the new tokens', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, tokens));

      const result = await sut.refresh('session.secret', {});

      const { url, init } = lastCall();
      expect(result).toEqual(tokens);
      expect(url).toBe(`${env.authApiBaseUrl}/auth/refresh`);
      expect(JSON.parse(init.body as string)).toEqual({ refreshToken: 'session.secret' });
    });

    it('should relay the Retry-After seconds of a 429', async () => {
      fetchMock.mockResolvedValue(jsonResponse(429, { message: 'Too many attempts', code: 'RATE_LIMITED' }, { 'Retry-After': '120' }));

      await expect(sut.refresh('session.secret', {})).rejects.toMatchObject({
        statusCode : 429,
        code       : 'RATE_LIMITED',
        retryAfter : 120,
      });
    });

    it('should ignore a Retry-After that is not a number of seconds', async () => {
      fetchMock.mockResolvedValue(jsonResponse(429, { message: 'Too many attempts', code: 'RATE_LIMITED' }, { 'Retry-After': 'tomorrow' }));

      await expect(sut.refresh('session.secret', {})).rejects.toMatchObject({ statusCode: 429, retryAfter: undefined });
    });
  });

  describe('logout and logoutAll', () => {
    it('should post the refresh token to /auth/logout', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await expect(sut.logout('session.secret', {})).resolves.toBeUndefined();

      expect(lastCall().url).toBe(`${env.authApiBaseUrl}/auth/logout`);
    });

    it('should post the refresh token to /auth/logout-all', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await expect(sut.logoutAll('session.secret', {})).resolves.toBeUndefined();

      expect(lastCall().url).toBe(`${env.authApiBaseUrl}/auth/logout-all`);
    });
  });

  describe('failures of the authentication API', () => {
    it('should answer 400 BAD_REQUEST when the authentication API refuses the body', async () => {
      fetchMock.mockResolvedValue(jsonResponse(400, { message: 'Invalid body', errors: {}, issues: [] }));

      await expect(sut.refresh('session.secret', {})).rejects.toMatchObject({
        statusCode : 400,
        code       : 'BAD_REQUEST',
        message    : 'Invalid body',
      });
    });

    it.each([500, 502, 503])('should answer 503 AUTH_API_UNAVAILABLE when the authentication API answers %s', async (status) => {
      fetchMock.mockResolvedValue(jsonResponse(status, { message: 'Internal server error' }));

      await expect(sut.refresh('session.secret', {})).rejects.toMatchObject({
        statusCode : 503,
        code       : 'AUTH_API_UNAVAILABLE',
      });
    });

    it('should answer 503 when the failure is not JSON', async () => {
      fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));

      await expect(sut.refresh('session.secret', {})).rejects.toMatchObject({ statusCode: 503, code: 'AUTH_API_UNAVAILABLE' });
    });

    it('should answer 503 and not 401 when the authentication API refuses the API key of this API', async () => {
      fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Invalid API key', code: 'CLIENT_INVALID' }));

      await expect(sut.authenticate('Bearer user-token')).rejects.toMatchObject({
        statusCode : 503,
        code       : 'AUTH_API_UNAVAILABLE',
      });
    });

    it('should answer 503 when the authentication API cannot be reached', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'));

      await expect(sut.authenticate('Bearer user-token')).rejects.toMatchObject({
        statusCode : 503,
        code       : 'AUTH_API_UNAVAILABLE',
      });
    });

    it('should call the authentication API with a timeout', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, tokens));

      await sut.refresh('session.secret', {});

      expect(lastCall().init.signal).toBeInstanceOf(AbortSignal);
    });

    it('should not log tokens, codes or bodies when the call fails', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'));

      await expect(sut.refresh('session.secret', {})).rejects.toBeDefined();

      const logged = JSON.stringify(vi.mocked(console.error).mock.calls);
      expect(logged).not.toContain('session.secret');
    });
  });
});
