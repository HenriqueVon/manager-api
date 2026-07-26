import request from 'supertest';
import express from 'express';
import type { Request, Response } from 'express';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const { controllerSpy } = vi.hoisted(() => ({
  controllerSpy: vi.fn(),
}));

vi.mock('@shared/http/controller.adapter', () => ({
  controllerAdapter: (
    _controller: unknown,
    method: string
  ) => {
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

import financialBankAccountRouter from '../financial-bank-account.routes';

describe('FinancialBankAccount routes', () => {
  let app: express.Express;

  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial/bank-accounts', financialBankAccountRouter);
  });

  describe('GET /financial/bank-accounts', () => {
    it('should call list controller when query is valid', async () => {
      const response = await request(app)
        .get('/financial/bank-accounts')
        .query({
          limit          : 10,
          offset         : 0,
          orderBy        : 'name',
          orderDirection : 'asc',
        });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'list',
        expect.anything()
      );
    });

    it('should coerce numeric query parameters before calling controller', async () => {
      const response = await request(app)
        .get('/financial/bank-accounts')
        .query({
          limit  : '10',
          offset : '5',
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toMatchObject({
        limit  : 10,
        offset : 5,
      });
    });

    it('should return 400 when orderBy is invalid', async () => {
      const response = await request(app)
        .get('/financial/bank-accounts')
        .query({ orderBy: 'balance' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(
        response.body.issues.some(
          (issue: any) => issue.path === 'orderBy'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra query parameters are provided', async () => {
      const response = await request(app)
        .get('/financial/bank-accounts')
        .query({ unknown: 'value' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/bank-accounts', () => {
    const validBody = {
      name                : 'REVOLUT',
      type                : 'PERSONAL',
      balance             : 1000,
      ledgerId            : validCuid,
      financialCurrencyId : validCuid,
    };

    it('should return 400 when name is too short', async () => {
      const response = await request(app)
        .post('/financial/bank-accounts')
        .send({ ...validBody, name: 'AB' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'name' &&
            issue.message === 'Name must have at least 3 characters'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when type is invalid', async () => {
      const response = await request(app)
        .post('/financial/bank-accounts')
        .send({ ...validBody, type: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) => issue.path === 'type'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when required relationship ids are missing', async () => {
      const response = await request(app)
        .post('/financial/bank-accounts')
        .send({ name: 'REVOLUT', type: 'PERSONAL' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) => issue.path === 'ledgerId'
        )
      ).toBe(true);
      expect(
        response.body.issues.some(
          (issue: any) => issue.path === 'financialCurrencyId'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .post('/financial/bank-accounts')
        .send({ ...validBody, extra: 'not-allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should apply default balance and call create controller', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { balance: _balance, ...bodyWithoutBalance } = validBody;

      const response = await request(app)
        .post('/financial/bank-accounts')
        .send(bodyWithoutBalance);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledTimes(1);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body).toEqual({
        ...bodyWithoutBalance,
        balance: 0,
      });
    });

    it('should call create controller when body is valid', async () => {
      const response = await request(app)
        .post('/financial/bank-accounts')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'create',
        expect.anything()
      );
    });
  });

  describe('GET /financial/bank-accounts/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).get(
        '/financial/bank-accounts/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'id' && issue.message === 'Invalid id'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call getById controller when id is valid', async () => {
      const response = await request(app).get(
        `/financial/bank-accounts/${validCuid}`
      );

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'getById',
        expect.anything()
      );
    });
  });

  describe('PATCH /financial/bank-accounts/:id', () => {
    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .patch(`/financial/bank-accounts/${validCuid}`)
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

    it('should return 400 when id is invalid', async () => {
      const response = await request(app)
        .patch('/financial/bank-accounts/123')
        .send({ balance: 1500 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .patch(`/financial/bank-accounts/${validCuid}`)
        .send({ balance: 1500, extra: 'not-allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call update controller when request is valid', async () => {
      const response = await request(app)
        .patch(`/financial/bank-accounts/${validCuid}`)
        .send({ name: 'ACTIVOBANK', balance: 1500 });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'update',
        expect.anything()
      );
    });
  });

  describe('DELETE /financial/bank-accounts/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).delete(
        '/financial/bank-accounts/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call delete controller when id is valid', async () => {
      const response = await request(app).delete(
        `/financial/bank-accounts/${validCuid}`
      );

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'delete',
        expect.anything()
      );
    });
  });
});
