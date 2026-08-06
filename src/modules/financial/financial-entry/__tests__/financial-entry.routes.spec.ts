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

import financialEntryRouter from '../financial-entry.routes';

describe('FinancialEntry routes', () => {
  let app: express.Express;

  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';

  const validBody = {
    type                   : 'PAYABLE',
    dueDate                : '2026-08-10',
    paymentDate            : null,
    amount                 : 100,
    amountPaid             : 0,
    additionalDescription  : 'MONTHLY INTERNET',
    isMonthly              : true,
    ledgerId               : validCuid,
    financialDescriptionId : validCuid,
    financialFundId        : validCuid,
    financialCategoryId    : validCuid,
  };

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial/entries', financialEntryRouter);
  });

  describe('GET /financial/entries', () => {
    it('should call list controller when query is valid', async () => {
      const response = await request(app)
        .get('/financial/entries')
        .query({
          limit          : 10,
          offset         : 0,
          orderBy        : 'dueDate',
          orderDirection : 'asc',
        });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('list', expect.anything());
    });

    it('should coerce numeric query parameters', async () => {
      const response = await request(app)
        .get('/financial/entries')
        .query({ limit: '10', offset: '5' });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.query).toMatchObject({ limit: 10, offset: 5 });
    });

    it('should return 400 when orderBy is invalid', async () => {
      const response = await request(app)
        .get('/financial/entries')
        .query({ orderBy: 'createdAt' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(response.body.issues.some((issue: any) => issue.path === 'orderBy')).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra query parameters are provided', async () => {
      const response = await request(app)
        .get('/financial/entries')
        .query({ unknown: 'value' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/entries', () => {
    it('should transform ISO dates and call create controller', async () => {
      const response = await request(app)
        .post('/financial/entries')
        .send({ ...validBody, paymentDate: '2026-08-12' });

      expect(response.status).toBe(201);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body.dueDate).toEqual(
        new Date('2026-08-10T00:00:00.000Z')
      );
      expect(requestReceived.body.paymentDate).toEqual(
        new Date('2026-08-12T00:00:00.000Z')
      );
    });

    it('should apply default amountPaid', async () => {
      const { amountPaid: _amountPaid, ...bodyWithoutAmountPaid } = validBody;

      const response = await request(app)
        .post('/financial/entries')
        .send(bodyWithoutAmountPaid);

      expect(response.status).toBe(201);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body.amountPaid).toBe(0);
    });

    it('should accept paymentDate as null', async () => {
      const response = await request(app)
        .post('/financial/entries')
        .send(validBody);

      expect(response.status).toBe(201);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body.paymentDate).toBeNull();
    });

    it('should return 400 when dueDate is invalid', async () => {
      const response = await request(app)
        .post('/financial/entries')
        .send({ ...validBody, dueDate: '10/08/2026' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'dueDate' &&
            issue.message === 'DueDate must be a valid ISO date'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when amount is negative', async () => {
      const response = await request(app)
        .post('/financial/entries')
        .send({ ...validBody, amount: -1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'amount' &&
            issue.message === 'Amount must be greater than or equal to 0'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .post('/financial/entries')
        .send({ ...validBody, extra: 'not-allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /financial/entries/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).get('/financial/entries/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(
        response.body.issues.some(
          (issue: any) => issue.path === 'id' && issue.message === 'Invalid id'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call getById controller when id is valid', async () => {
      const response = await request(app).get(
        `/financial/entries/${validCuid}`
      );

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('getById', expect.anything());
    });
  });

  describe('PATCH /financial/entries/:id', () => {
    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === '' &&
            issue.message === 'At least one field must be provided'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should transform dates before calling update controller', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({
          dueDate     : '2026-08-15',
          paymentDate : '2026-08-16',
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({
        dueDate     : new Date('2026-08-15T00:00:00.000Z'),
        paymentDate : new Date('2026-08-16T00:00:00.000Z'),
      });
    });

    it('should allow setting paymentDate to null', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ paymentDate: null });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({ paymentDate: null });
    });

    it('should return 400 when id is invalid', async () => {
      const response = await request(app)
        .patch('/financial/entries/123')
        .send({ amountPaid: 100 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ amountPaid: 100, extra: 'not-allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call update controller when request is valid', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ amountPaid: 100 });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('update', expect.anything());
    });
  });

  describe('DELETE /financial/entries/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).delete('/financial/entries/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call delete controller when id is valid', async () => {
      const response = await request(app).delete(
        `/financial/entries/${validCuid}`
      );

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('delete', expect.anything());
    });
  });
});
