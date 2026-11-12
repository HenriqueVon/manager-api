import '@docs/openapi/__tests__/test-env';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '@config/env';
import { app } from '../app';

// The order of the global middlewares of app.ts: API key, then the session routes, then the
// bearer token for everything else
describe('App authentication order', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('should require the API key on the session routes', async () => {
    const response = await request(app).post('/v1/api/auth/logout').send({ refreshToken: 'session.secret' });

    expect(response.status).toBe(401);
  });

  it('should reach the session routes with the API key and no bearer token', async () => {
    // An invalid body is answered by the route itself, so the bearer token was not required
    const response = await request(app)
      .post('/v1/api/auth/logout')
      .set('x-api-key', env.apiKey)
      .send({});

    expect(response.status).toBe(400);
  });

  it('should still require a bearer token on the other routes', async () => {
    const response = await request(app).get('/v1/api/ledgers').set('x-api-key', env.apiKey);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Missing Authorization header', code: 'UNAUTHORIZED' });
  });

  it('should still require a bearer token on /health', async () => {
    const response = await request(app).get('/health').set('x-api-key', env.apiKey);

    expect(response.status).toBe(401);
  });
});
