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

      if (method === 'create' || method === 'createInstallments' || method === 'createMonthly') {
        return res.status(201).json({ ok: true });
      }

      if (method === 'delete' || method === 'bulkDelete' || method === 'bulkPay') {
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
    it('should accept the type filter and reject an unknown type', async () => {
      const ok = await request(app).get('/financial/entries').query({ type: 'PAYABLE' });
      expect(ok.status).toBe(200);
      expect(controllerSpy.mock.calls[0][1].query.type).toBe('PAYABLE');

      const bad = await request(app).get('/financial/entries').query({ type: 'OTHER' });
      expect(bad.status).toBe(400);
    });

    it('should accept a search, trim it, and reject one longer than 100 characters', async () => {
      const ok = await request(app).get('/financial/entries').query({ search: '  light bill ' });
      expect(ok.status).toBe(200);
      expect(controllerSpy.mock.calls[0][1].query.search).toBe('light bill');

      const longest = await request(app).get('/financial/entries').query({ search: 'a'.repeat(100) });
      expect(longest.status).toBe(200);

      const bad = await request(app).get('/financial/entries').query({ search: 'a'.repeat(101) });
      expect(bad.status).toBe(400);
    });

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

    it('should convert the filters to their types', async () => {
      const response = await request(app)
        .get('/financial/entries')
        .query({
          ledgerId    : 'cm1234567890abcdefghijkl',
          dueDateFrom : '2026-01-01',
          dueDateTo   : '2026-01-31',
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toEqual({
        ledgerId    : 'cm1234567890abcdefghijkl',
        dueDateFrom : new Date('2026-01-01T00:00:00.000Z'),
        dueDateTo   : new Date('2026-01-31T00:00:00.000Z'),
      });
    });

    it('should accept a range with only one end, and the same day at both ends', async () => {
      const only = await request(app).get('/financial/entries').query({ dueDateFrom: '2026-01-01' });
      const sameDay = await request(app).get('/financial/entries').query({ dueDateFrom: '2026-01-15', dueDateTo: '2026-01-15' });

      expect(only.status).toBe(200);
      expect(sameDay.status).toBe(200);
    });

    it.each(['2026-13-01', '2026-02-30', '01/01/2026', 'yesterday', '2026-01-01T00:00:00.000Z'])(
      'should return 400 when a date is not a valid ISO date (%s)',
      async (value) => {
        const response = await request(app).get('/financial/entries').query({ dueDateFrom: value });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid query');
        expect(response.body.issues.some((issue: any) => issue.path === 'dueDateFrom')).toBe(true);
        expect(controllerSpy).not.toHaveBeenCalled();
      }
    );

    it('should return 400 when the range ends before it starts', async () => {
      const response = await request(app)
        .get('/financial/entries')
        .query({ dueDateFrom: '2026-02-01', dueDateTo: '2026-01-31' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(response.body.issues.some((issue: any) => issue.path === 'dueDateTo')).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    it('should accept a body without additionalDescription', async () => {
      const body: Partial<typeof validBody> = { ...validBody };
      delete body.additionalDescription;

      const response = await request(app)
        .post('/financial/entries')
        .send(body);

      expect(response.status).toBe(201);
    });

    it('should accept additionalDescription as null', async () => {
      const response = await request(app)
        .post('/financial/entries')
        .send({ ...validBody, additionalDescription: null });

      expect(response.status).toBe(201);
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

    it('should return 400 when amountPaid is negative', async () => {
      const response = await request(app)
        .post('/financial/entries')
        .send({ ...validBody, amountPaid: -1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'amountPaid' &&
            issue.message === 'AmountPaid must be greater than or equal to 0'
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

  describe('POST /financial/entries/installments', () => {
    const installmentsBody = {
      type                   : 'PAYABLE',
      dueDate                : '2026-11-05',
      amount                 : 4000,
      installments           : 3,
      additionalDescription  : 'FLIGHT TICKET',
      ledgerId               : validCuid,
      financialDescriptionId : validCuid,
      financialFundId        : validCuid,
      financialCategoryId    : validCuid,
    };

    it('should transform the date and call the createInstallments controller', async () => {
      const response = await request(app)
        .post('/financial/entries/installments')
        .send(installmentsBody);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledWith('createInstallments', expect.anything());

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body.dueDate).toEqual(new Date('2026-11-05T00:00:00.000Z'));
      expect(requestReceived.body.installments).toBe(3);
    });

    it('should accept a body without additionalDescription', async () => {
      const body: Partial<typeof installmentsBody> = { ...installmentsBody };
      delete body.additionalDescription;

      const response = await request(app)
        .post('/financial/entries/installments')
        .send(body);

      expect(response.status).toBe(201);
    });

    it('should accept the limits of installments', async () => {
      for (const installments of [2, 480]) {
        const response = await request(app)
          .post('/financial/entries/installments')
          .send({ ...installmentsBody, installments });

        expect(response.status).toBe(201);
      }
    });

    it('should return 400 when installments is out of range or not an integer', async () => {
      for (const installments of [1, 0, 481, 2.5, '3']) {
        const response = await request(app)
          .post('/financial/entries/installments')
          .send({ ...installmentsBody, installments });

        expect(response.status).toBe(400);
      }

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when installments is missing', async () => {
      const body: Partial<typeof installmentsBody> = { ...installmentsBody };
      delete body.installments;

      const response = await request(app)
        .post('/financial/entries/installments')
        .send(body);

      expect(response.status).toBe(400);
    });

    it('should return 400 when the amount is less than one cent per installment', async () => {
      const response = await request(app)
        .post('/financial/entries/installments')
        .send({ ...installmentsBody, amount: 0.02, installments: 3 });

      expect(response.status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the complement leaves no room for the installment number', async () => {
      const response = await request(app)
        .post('/financial/entries/installments')
        .send({ ...installmentsBody, installments: 480, additionalDescription: 'A'.repeat(95) });

      expect(response.status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 for the fields that do not apply to installments', async () => {
      for (const extra of [{ paymentDate: '2026-11-05' }, { amountPaid: 10 }, { isMonthly: true }]) {
        const response = await request(app)
          .post('/financial/entries/installments')
          .send({ ...installmentsBody, ...extra });

        expect(response.status).toBe(400);
      }

      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/entries/monthly', () => {
    const monthlyBody = {
      type                   : 'PAYABLE',
      dueDate                : '2026-11-05',
      amount                 : 120,
      repeatCount            : 12,
      additionalDescription  : 'INTERNET',
      ledgerId               : validCuid,
      financialDescriptionId : validCuid,
      financialFundId        : validCuid,
      financialCategoryId    : validCuid,
    };

    it('should transform the date and call the createMonthly controller', async () => {
      const response = await request(app)
        .post('/financial/entries/monthly')
        .send(monthlyBody);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledWith('createMonthly', expect.anything());

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body.dueDate).toEqual(new Date('2026-11-05T00:00:00.000Z'));
      expect(requestReceived.body.repeatCount).toBe(12);
    });

    it('should accept a body without additionalDescription', async () => {
      const body: Partial<typeof monthlyBody> = { ...monthlyBody };
      delete body.additionalDescription;

      const response = await request(app)
        .post('/financial/entries/monthly')
        .send(body);

      expect(response.status).toBe(201);
    });

    it('should accept the limits of repeatCount', async () => {
      for (const repeatCount of [2, 60]) {
        const response = await request(app)
          .post('/financial/entries/monthly')
          .send({ ...monthlyBody, repeatCount });

        expect(response.status).toBe(201);
      }
    });

    it('should return 400 when repeatCount is out of range or not an integer', async () => {
      for (const repeatCount of [1, 0, 61, 2.5, '3']) {
        const response = await request(app)
          .post('/financial/entries/monthly')
          .send({ ...monthlyBody, repeatCount });

        expect(response.status).toBe(400);
      }

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when repeatCount is missing', async () => {
      const body: Partial<typeof monthlyBody> = { ...monthlyBody };
      delete body.repeatCount;

      const response = await request(app)
        .post('/financial/entries/monthly')
        .send(body);

      expect(response.status).toBe(400);
    });

    it('should return 400 for the fields that do not apply to monthly entries', async () => {
      for (const extra of [{ paymentDate: '2026-11-05' }, { amountPaid: 10 }, { isMonthly: true }, { installments: 3 }]) {
        const response = await request(app)
          .post('/financial/entries/monthly')
          .send({ ...monthlyBody, ...extra });

        expect(response.status).toBe(400);
      }

      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/entries/bulk-delete', () => {
    const cuid = (index: number) => `ckl8p2x1a${String(index).padStart(4, '0')}x8kq3b0c9a1z`;

    it('should call the bulkDelete controller when the ids are valid', async () => {
      const response = await request(app)
        .post('/financial/entries/bulk-delete')
        .send({ ids: [cuid(1), cuid(2)] });

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('bulkDelete', expect.anything());

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({ ids: [cuid(1), cuid(2)] });
    });

    it('should delete a repeated id once', async () => {
      await request(app)
        .post('/financial/entries/bulk-delete')
        .send({ ids: [cuid(1), cuid(2), cuid(1)] });

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body.ids).toEqual([cuid(1), cuid(2)]);
    });

    it('should accept from 1 to 100 ids', async () => {
      for (const count of [1, 100]) {
        const response = await request(app)
          .post('/financial/entries/bulk-delete')
          .send({ ids: Array.from({ length: count }, (_, index) => cuid(index)) });

        expect(response.status).toBe(204);
      }
    });

    it('should return 400 for no ids, more than 100, or an invalid id', async () => {
      const bodies = [
        { ids: [] },
        { ids: Array.from({ length: 101 }, (_, index) => cuid(index)) },
        { ids: [cuid(1), '123'] },
        { ids: 'not-an-array' },
        {},
      ];

      for (const body of bodies) {
        const response = await request(app)
          .post('/financial/entries/bulk-delete')
          .send(body);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid body');
      }

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should count the repeated ids in the limit of 100', async () => {
      const ids = [...Array.from({ length: 100 }, (_, index) => cuid(index)), cuid(0)];

      const response = await request(app)
        .post('/financial/entries/bulk-delete')
        .send({ ids });

      expect(response.status).toBe(400);
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .post('/financial/entries/bulk-delete')
        .send({ ids: [cuid(1)], extra: 'not-allowed' });

      expect(response.status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/entries/bulk-pay', () => {
    const cuid = (index: number) => `ckl8p2x1a${String(index).padStart(4, '0')}x8kq3b0c9a1z`;

    it('should call the bulkPay controller when the ids are valid', async () => {
      const response = await request(app)
        .post('/financial/entries/bulk-pay')
        .send({ ids: [cuid(1), cuid(2)] });

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('bulkPay', expect.anything());

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({ ids: [cuid(1), cuid(2)] });
    });

    it('should pay a repeated id once', async () => {
      await request(app)
        .post('/financial/entries/bulk-pay')
        .send({ ids: [cuid(1), cuid(2), cuid(1)] });

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body.ids).toEqual([cuid(1), cuid(2)]);
    });

    it('should accept from 1 to 100 ids', async () => {
      for (const count of [1, 100]) {
        const response = await request(app)
          .post('/financial/entries/bulk-pay')
          .send({ ids: Array.from({ length: count }, (_, index) => cuid(index)) });

        expect(response.status).toBe(204);
      }
    });

    it('should return 400 for no ids, more than 100, an invalid id or extra fields', async () => {
      const bodies = [
        { ids: [] },
        { ids: Array.from({ length: 101 }, (_, index) => cuid(index)) },
        { ids: [cuid(1), '123'] },
        { ids: 'not-an-array' },
        {},
        { ids: [cuid(1)], paymentDate: '2026-11-05' },
      ];

      for (const body of bodies) {
        const response = await request(app)
          .post('/financial/entries/bulk-pay')
          .send(body);

        expect(response.status).toBe(400);
      }

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

    it('should allow clearing additionalDescription with null', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ additionalDescription: null });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({ additionalDescription: null });
    });

    it('should allow setting paymentDate to null', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ paymentDate: null });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({ paymentDate: null });
    });

    it('should return 400 when amount is negative', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ amount: -1 });

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

    it('should return 400 when amountPaid is negative', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ amountPaid: -1 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'amountPaid' &&
            issue.message === 'AmountPaid must be greater than or equal to 0'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should accept zero for amount and amountPaid', async () => {
      const response = await request(app)
        .patch(`/financial/entries/${validCuid}`)
        .send({ amount: 0, amountPaid: 0 });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({ amount: 0, amountPaid: 0 });
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
