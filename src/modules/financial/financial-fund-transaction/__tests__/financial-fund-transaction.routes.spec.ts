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

import financialFundTransactionRouter from '../financial-fund-transaction.routes';

describe('FinancialFundTransaction routes', () => {
  let app: express.Express;

  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';

  const validBody = {
    transactionDate        : '2026-08-08',
    amountCredit           : 100,
    amountDebit            : 0,
    additionalDescription  : 'SALARY PAYMENT',
    ledgerId               : validCuid,
    financialDescriptionId : validCuid,
    financialFundId        : validCuid,
    financialCategoryId    : validCuid,
    financialBankAccountId : validCuid,
  };

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());

    app.use(
      '/financial/funds/transactions',
      financialFundTransactionRouter
    );
  });

  describe('GET /financial/funds/transactions', () => {
    it('should call list controller when query is valid', async () => {
      const response = await request(app)
        .get('/financial/funds/transactions')
        .query({
          limit          : 10,
          offset         : 0,
          orderBy        : 'transactionDate',
          orderDirection : 'desc',
        });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'list',
        expect.anything()
      );
    });

    it('should coerce numeric query parameters', async () => {
      const response = await request(app)
        .get('/financial/funds/transactions')
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
        .get('/financial/funds/transactions')
        .query({
          orderBy: 'createdAt',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/funds/transactions', () => {
    it('should transform transactionDate and call create controller', async () => {
      const response = await request(app)
        .post('/financial/funds/transactions')
        .send(validBody);

      expect(response.status).toBe(201);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body.transactionDate).toEqual(
        new Date('2026-08-08')
      );
    });

    it('should default amountDebit to 0', async () => {
      const { amountDebit: _amountDebit, ...bodyWithoutDebit } = validBody;

      const response = await request(app)
        .post('/financial/funds/transactions')
        .send(bodyWithoutDebit);

      expect(response.status).toBe(201);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body.amountDebit).toBe(0);
    });

    it('should return 400 when transactionDate is invalid', async () => {
      const response = await request(app)
        .post('/financial/funds/transactions')
        .send({
          ...validBody,
          transactionDate: '08/08/2026',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when amountCredit is negative', async () => {
      const response = await request(app)
        .post('/financial/funds/transactions')
        .send({
          ...validBody,
          amountCredit: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .post('/financial/funds/transactions')
        .send({
          ...validBody,
          extra: 'not-allowed',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /financial/funds/transactions/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).get(
        '/financial/funds/transactions/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call getById controller when id is valid', async () => {
      const response = await request(app).get(
        `/financial/funds/transactions/${validCuid}`
      );

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /financial/funds/transactions/:id', () => {
    it('should transform transactionDate and preserve only provided fields', async () => {
      const response = await request(app)
        .patch(`/financial/funds/transactions/${validCuid}`)
        .send({
          transactionDate : '2026-08-09',
          amountCredit    : 100,
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body).toEqual({
        transactionDate : new Date('2026-08-09T00:00:00.000Z'),
        amountCredit    : 100,
      });
    });

    it('should allow updating only additionalDescription', async () => {
      const response = await request(app)
        .patch(`/financial/funds/transactions/${validCuid}`)
        .send({
          additionalDescription: 'UPDATED DESCRIPTION',
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body).toEqual({
        additionalDescription: 'UPDATED DESCRIPTION',
      });
    });

    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .patch(`/financial/funds/transactions/${validCuid}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');

      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === '' &&
            issue.message ===
              'At least one field must be provided'
        )
      ).toBe(true);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when id is invalid', async () => {
      const response = await request(app)
        .patch('/financial/funds/transactions/123')
        .send({
          amountCredit: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /financial/funds/transactions/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).delete(
        '/financial/funds/transactions/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call delete controller when id is valid', async () => {
      const response = await request(app).delete(
        `/financial/funds/transactions/${validCuid}`
      );

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
