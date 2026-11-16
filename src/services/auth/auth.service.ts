import { injectable } from 'tsyringe';
import { Unauthorized, UpstreamAuthError } from '@shared/errors/app-error';
import { env } from '@config/env';

export type TokenResponse = {
  accessToken  : string;
  tokenType    : string;
  expiresIn    : number;
  refreshToken : string;
};

export type ExchangeCodeInput = {
  code         : string;
  codeVerifier : string;
  redirectUri  : string;
};

// The device of the user, reported by the frontend. The authentication API stores it as reported.
export type EndUser = {
  ip?        : string;
  userAgent? : string;
};

type PostOptions = {
  body?         : unknown;
  bearerToken?  : string;
  clientSecret? : string;
  endUser?      : EndUser;
};

const UNAVAILABLE_CODE = 'AUTH_API_UNAVAILABLE';

function unavailable(): UpstreamAuthError {
  return new UpstreamAuthError(503, 'Authentication service unavailable', UNAVAILABLE_CODE);
}

@injectable()
export class AuthService {
  async authenticate(authorization?: string): Promise<void> {
    if (!authorization) {
      throw new Unauthorized('Missing Authorization header');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new Unauthorized('Invalid Authorization header');
    }

    await this.post('/auth/validate', { bearerToken: token });
  }

  async exchangeCode(input: ExchangeCodeInput, endUser: EndUser): Promise<TokenResponse> {
    const response = await this.post('/auth/exchange-code', {
      body         : input,
      clientSecret : env.authClientSecret,
      endUser,
    });

    return response.json() as Promise<TokenResponse>;
  }

  async refresh(refreshToken: string, endUser: EndUser): Promise<TokenResponse> {
    const response = await this.post('/auth/refresh', { body: { refreshToken }, endUser });

    return response.json() as Promise<TokenResponse>;
  }

  async logout(refreshToken: string, endUser: EndUser): Promise<void> {
    await this.post('/auth/logout', { body: { refreshToken }, endUser });
  }

  async logoutAll(refreshToken: string, endUser: EndUser): Promise<void> {
    await this.post('/auth/logout-all', { body: { refreshToken }, endUser });
  }

  // Calls the authentication API as the Client of this API. A failure becomes an UpstreamAuthError:
  // the error of the authentication API, or 503 when it cannot be used.
  private async post(path: string, options: PostOptions): Promise<Response> {
    const headers: Record<string, string> = {
      'x-api-key' : env.authApiKey,
      Accept      : 'application/json',
    };

    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (options.bearerToken) headers['Authorization'] = `Bearer ${options.bearerToken}`;
    if (options.clientSecret) headers['x-client-secret'] = options.clientSecret;
    if (options.endUser?.ip) headers['x-end-user-ip'] = options.endUser.ip;
    if (options.endUser?.userAgent) headers['x-end-user-agent'] = options.endUser.userAgent;

    let response: Response;

    try {
      response = await fetch(`${env.authApiBaseUrl}${path}`, {
        method : 'POST',
        headers,
        body   : options.body === undefined ? undefined : JSON.stringify(options.body),
        signal : AbortSignal.timeout(env.authApiTimeoutMs),
      });
    } catch (error) {
      // The message says why (timeout, DNS, refused) and carries no header or body values
      console.error({ event: 'AUTH_API_UNREACHABLE', path, error: error instanceof Error ? error.message : String(error) });
      throw unavailable();
    }

    if (response.ok) return response;

    throw await this.toUpstreamError(path, response);
  }

  private async toUpstreamError(path: string, response: Response): Promise<UpstreamAuthError> {
    let body: { message?: unknown; code?: unknown } = {};

    try {
      body = await response.json() as typeof body;
    } catch {
      // Not JSON, for example a gateway error page
    }

    const message = typeof body.message === 'string' ? body.message : 'Authentication failed';
    const code = typeof body.code === 'string' ? body.code : undefined;

    // A 5xx is a failure of the authentication API. CLIENT_INVALID means the API key or the client
    // secret of this API is wrong, which the user cannot fix: it must not look like an expired session.
    if (response.status >= 500 || code === 'CLIENT_INVALID') {
      console.error({ event: 'AUTH_API_FAILED', path, status: response.status, code });
      return unavailable();
    }

    if (response.status === 400) {
      return new UpstreamAuthError(400, message, 'BAD_REQUEST');
    }

    const retryAfterHeader = response.headers.get('Retry-After');
    const retryAfter = retryAfterHeader && /^\d+$/.test(retryAfterHeader) ? Number(retryAfterHeader) : undefined;

    return new UpstreamAuthError(response.status, message, code, retryAfter);
  }
}
