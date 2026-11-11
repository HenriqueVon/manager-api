import './test-env';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { env } from '@config/env';
import { apiKeyMiddleware, errorHandler, validateRequest } from '@shared/http/middlewares';
import {
  AppError,
  BadRequestError,
  Unauthorized,
  Forbidden,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
} from '@shared/errors/app-error';
import {
  appErrorResponseSchema,
  validationErrorResponseSchema,
  internalErrorResponseSchema,
} from '@shared/schemas/error-response.schema';

// The documented error bodies (src/shared/schemas/error-response.schema.ts) must match
// what the real middlewares produce
const appErrors: Record<string, AppError> = {
  BadRequestError      : new BadRequestError(),
  Unauthorized         : new Unauthorized(),
  Forbidden            : new Forbidden(),
  NotFoundError        : new NotFoundError(),
  ConflictError        : new ConflictError(),
  PayloadTooLargeError : new PayloadTooLargeError(),
};

const app = express();
app.use(express.json());
app.post(
  '/validation',
  validateRequest({ body: z.object({ name: z.string() }).strict() }),
  (_req, res) => res.status(204).send()
);
app.get('/app-error/:name', (req) => {
  throw appErrors[req.params.name];
});
app.get('/unexpected', () => {
  throw new Error('boom');
});
app.get('/api-key', apiKeyMiddleware, (_req, res) => res.status(204).send());
app.post('/json', (_req, res) => res.status(204).send());
app.use(errorHandler);

// Same pipeline with a tiny body limit, to trigger the payload too large error
const smallBodyApp = express();
smallBodyApp.use(express.json({ limit: '10b' }));
smallBodyApp.post('/json', (_req, res) => res.status(204).send());
smallBodyApp.use(errorHandler);

describe('Documented error responses', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('should match the validation error body (ValidationErrorResponse)', async () => {
    const res = await request(app).post('/validation').send({ extra: true });

    expect(res.status).toBe(400);
    expect(validationErrorResponseSchema.safeParse(res.body).success).toBe(true);
  });

  it.each(Object.keys(appErrors))('should match the %s body (AppErrorResponse)', async (name) => {
    const res = await request(app).get(`/app-error/${name}`);

    expect(res.status).toBe(appErrors[name].statusCode);
    expect(appErrorResponseSchema.safeParse(res.body).success).toBe(true);
  });

  it('should return 400 with an AppErrorResponse for a malformed JSON body', async () => {
    const res = await request(app).post('/json').set('Content-Type', 'application/json').send('{bad json');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Malformed JSON body', code: 'BAD_REQUEST' });
    expect(appErrorResponseSchema.safeParse(res.body).success).toBe(true);
  });

  it('should return 413 with an AppErrorResponse when the JSON body is too large', async () => {
    const res = await request(smallBodyApp).post('/json').send({ name: 'a body larger than ten bytes' });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ message: 'Payload too large', code: 'PAYLOAD_TOO_LARGE' });
    expect(appErrorResponseSchema.safeParse(res.body).success).toBe(true);
  });

  it('should match the unexpected error body (InternalErrorResponse)', async () => {
    const res = await request(app).get('/unexpected');

    expect(res.status).toBe(500);
    expect(internalErrorResponseSchema.safeParse(res.body).success).toBe(true);
  });

  it('should return 401 with an AppErrorResponse when x-api-key is missing', async () => {
    const res = await request(app).get('/api-key');

    expect(res.status).toBe(401);
    expect(appErrorResponseSchema.safeParse(res.body).success).toBe(true);
  });

  it('should return 403 with an AppErrorResponse when x-api-key is invalid', async () => {
    const res = await request(app).get('/api-key').set('x-api-key', `${env.apiKey}-wrong`);

    expect(res.status).toBe(403);
    expect(appErrorResponseSchema.safeParse(res.body).success).toBe(true);
  });
});
