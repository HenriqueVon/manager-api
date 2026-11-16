import { z } from 'zod';
import { apiKeyAuth, openApiRegistry } from '@docs/openapi/registry';
import { globalErrorResponses, responseRef } from '@docs/openapi/responses';
import { exchangeCodeSchema, refreshTokenSchema, tokenResponseSchema } from './schemas';

const exchangeCodeInput = openApiRegistry.register('ExchangeCodeInput', exchangeCodeSchema);
const refreshTokenInput = openApiRegistry.register('RefreshTokenInput', refreshTokenSchema);
const tokenResponse = openApiRegistry.register('TokenResponse', tokenResponseSchema);

const exchangeCodeExample = {
  code         : 'a1b2c3d4e5f6',
  codeVerifier : 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
  redirectUri  : 'https://app.example.com/auth/callback',
};

const refreshTokenExample = {
  refreshToken: '<session-id>.<secret>',
};

const tokensExample = {
  accessToken  : 'eyJhbGciOiJIUzI1NiJ9...',
  tokenType    : 'Bearer',
  expiresIn    : 900,
  refreshToken : '<session-id>.<secret>',
};

// The session routes take no bearer token: they are how the user gets one. They only need the API key.
const apiKeyOnly = [{ [apiKeyAuth.name]: [] }];

const endUserHeaders = z.object({
  'x-end-user-ip': z.string().optional()
    .openapi({ description: 'IP of the device of the user, reported by the frontend. The authentication API stores it as reported.' }),
  'x-end-user-agent': z.string().optional()
    .openapi({ description: 'User agent of the browser of the user, reported by the frontend.' }),
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/auth/exchange-code',
  tags        : ['Auth'],
  summary     : 'Exchange the social login code for tokens',
  description : 'Last step of the Google login. The frontend sends the single-use `code` received on its redirect URL, the PKCE `codeVerifier` and the same `redirectUri` used at the start. Relayed to the authentication API with the API key of the Client of this API.',
  operationId : 'exchangeAuthCode',
  security    : apiKeyOnly,
  request     : {
    headers : endUserHeaders,
    body    : {
      required : true,
      content  : {
        'application/json': {
          schema  : exchangeCodeInput,
          example : exchangeCodeExample,
        },
      },
    },
  },
  responses: {
    200: {
      description : 'Tokens issued',
      content     : {
        'application/json': {
          schema  : tokenResponse,
          example : tokensExample,
        },
      },
    },
    400 : responseRef('ValidationError'),
    429 : responseRef('TooManyRequests'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/auth/refresh',
  tags        : ['Auth'],
  summary     : 'Refresh the tokens',
  description : 'Exchanges the refresh token for new tokens. The refresh token is replaced on every call; using a replaced one ends the whole session, so two refreshes must never run at the same time.',
  operationId : 'refreshAuthTokens',
  security    : apiKeyOnly,
  request     : {
    headers : endUserHeaders,
    body    : {
      required : true,
      content  : {
        'application/json': {
          schema  : refreshTokenInput,
          example : refreshTokenExample,
        },
      },
    },
  },
  responses: {
    200: {
      description : 'Tokens issued',
      content     : {
        'application/json': {
          schema  : tokenResponse,
          example : tokensExample,
        },
      },
    },
    400 : responseRef('ValidationError'),
    429 : responseRef('TooManyRequests'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/auth/logout',
  tags        : ['Auth'],
  summary     : 'Log out',
  description : 'Ends the session of the refresh token. Answers 204 whether or not the session existed.',
  operationId : 'logoutAuth',
  security    : apiKeyOnly,
  request     : {
    headers : endUserHeaders,
    body    : {
      required : true,
      content  : {
        'application/json': {
          schema  : refreshTokenInput,
          example : refreshTokenExample,
        },
      },
    },
  },
  responses: {
    204 : { description: 'Session ended' },
    400 : responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});

openApiRegistry.registerPath({
  method      : 'post',
  path        : '/auth/logout-all',
  tags        : ['Auth'],
  summary     : 'Log out from all devices',
  description : 'Ends every session of the user of the refresh token in this Client. Answers 204 whether or not the session existed.',
  operationId : 'logoutAllAuth',
  security    : apiKeyOnly,
  request     : {
    headers : endUserHeaders,
    body    : {
      required : true,
      content  : {
        'application/json': {
          schema  : refreshTokenInput,
          example : refreshTokenExample,
        },
      },
    },
  },
  responses: {
    204 : { description: 'Sessions ended' },
    400 : responseRef('ValidationError'),
    ...globalErrorResponses,
  },
});
