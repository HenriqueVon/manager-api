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

      if (method === 'create') {
        return res.status(201).json({ ok: true });
      }

      if (method === 'delete') {
        return res.status(204).send();
      }

      return res.status(200).json({ ok: true });
    };
  },
}));

import financialFundRouter from '../financial-fund.routes';

describe('FinancialFund routes', () => {
  let app: express.Express;
  const validCuid = 'cm1234567890abcdefghijk';

  beforeEach(() => {
    controllerSpy.mockClear();
    app = express();
    app.use(express.json());
    app.use('/financial/funds', financialFundRouter);
  });

  describe('GET /financial/funds', () => {
    it('should coerce valid query parameters and call list controller', async () => {
      const response = await request(app)
        .get('/financial/funds')
        .query({ limit: '10', offset: '5', orderBy: 'name', orderDirection: 'asc' });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);

      const receivedRequest = controllerSpy.mock.calls[0][1] as Request;
      expect(receivedRequest.query).toMatchObject({
        limit          : 10,
        offset         : 5,
        orderBy        : 'name',
        orderDirection : 'asc',
      });
    });

    it('should return 400 when query is invalid', async () => {
      const response = await request(app)
        .get('/financial/funds')
        .query({ orderBy: 'balance' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/funds', () => {
    const validBody = {
      name                : 'BASIC EXPENSES',
      balance             : 1000,
      ledgerId            : validCuid,
      financialCurrencyId : validCuid,
    };

    it('should return 400 when body is invalid', async () => {
      const response = await request(app)
        .post('/financial/funds')
        .send({ ...validBody, name: 'AB' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should apply default balance before calling create controller', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { balance: _balance, ...bodyWithoutBalance } = validBody;

      const response = await request(app)
        .post('/financial/funds')
        .send(bodyWithoutBalance);

      expect(response.status).toBe(201);

      const receivedRequest = controllerSpy.mock.calls[0][1] as Request;
      expect(receivedRequest.body).toEqual({
        ...bodyWithoutBalance,
        balance: 0,
      });
    });

    it('should reject extra body fields', async () => {
      const response = await request(app)
        .post('/financial/funds')
        .send({ ...validBody, extra: 'not-allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /financial/funds/:id', () => {
    it('should reject an invalid id', async () => {
      const response = await request(app).get('/financial/funds/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call getById controller for a valid id', async () => {
      const response = await request(app).get(`/financial/funds/${validCuid}`);

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('getById', expect.anything());
    });
  });

  describe('PATCH /financial/funds/:id', () => {
    it('should reject an empty body', async () => {
      const response = await request(app)
        .patch(`/financial/funds/${validCuid}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call update controller for a valid request', async () => {
      const response = await request(app)
        .patch(`/financial/funds/${validCuid}`)
        .send({ name: 'VACATION', balance: 1500 });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('update', expect.anything());
    });
  });

  describe('DELETE /financial/funds/:id', () => {
    it('should reject an invalid id', async () => {
      const response = await request(app).delete('/financial/funds/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call delete controller for a valid id', async () => {
      const response = await request(app).delete(`/financial/funds/${validCuid}`);

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('delete', expect.anything());
    });
  });
});
