import '@docs/openapi/__tests__/test-env';
import request from 'supertest';
import express from 'express';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { controllerSpy } = vi.hoisted(() => ({
  controllerSpy: vi.fn(),
}));

vi.mock('@shared/http/controller.adapter', () => ({
  controllerAdapter: (_controller: unknown, method: string) => {
    return (req: Request, res: Response) => {
      controllerSpy(method, req);

      if (method === 'logout' || method === 'logoutAll') {
        return res.status(204).send();
      }

      return res.status(200).json({ ok: true });
    };
  },
}));

import authRouter from '../auth.routes';

describe('Auth routes', () => {
  let app: express.Express;

  const validExchangeCode = {
    code         : 'code-1',
    codeVerifier : 'v'.repeat(43),
    redirectUri  : 'https://app.example.com/auth/callback',
  };

  const validRefreshToken = { refreshToken: 'session.secret' };

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  describe('POST /auth/exchange-code', () => {
    it('should call the exchangeCode controller when the body is valid', async () => {
      const response = await request(app).post('/auth/exchange-code').send(validExchangeCode);

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('exchangeCode', expect.anything());
    });

    it.each([
      ['a missing code', { ...validExchangeCode, code: undefined }],
      ['a short codeVerifier', { ...validExchangeCode, codeVerifier: 'short' }],
      ['a codeVerifier with invalid characters', { ...validExchangeCode, codeVerifier: '!'.repeat(43) }],
      ['a missing redirectUri', { ...validExchangeCode, redirectUri: undefined }],
      ['an unknown field', { ...validExchangeCode, extra: true }],
    ])('should return 400 for %s', async (_name, body) => {
      const response = await request(app).post('/auth/exchange-code').send(body);

      expect(response.status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh', () => {
    it('should call the refresh controller when the body is valid', async () => {
      const response = await request(app).post('/auth/refresh').send(validRefreshToken);

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('refresh', expect.anything());
    });

    it.each([
      ['a missing refreshToken', {}],
      ['an empty refreshToken', { refreshToken: '' }],
      ['a refreshToken longer than 512 characters', { refreshToken: 'a'.repeat(513) }],
      ['an unknown field', { ...validRefreshToken, extra: true }],
    ])('should return 400 for %s', async (_name, body) => {
      const response = await request(app).post('/auth/refresh').send(body);

      expect(response.status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('should call the logout controller when the body is valid', async () => {
      const response = await request(app).post('/auth/logout').send(validRefreshToken);

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('logout', expect.anything());
    });

    it('should return 400 when the refreshToken is missing', async () => {
      const response = await request(app).post('/auth/logout').send({});

      expect(response.status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout-all', () => {
    it('should call the logoutAll controller when the body is valid', async () => {
      const response = await request(app).post('/auth/logout-all').send(validRefreshToken);

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('logoutAll', expect.anything());
    });

    it('should return 400 when the refreshToken is missing', async () => {
      const response = await request(app).post('/auth/logout-all').send({});

      expect(response.status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });
});
