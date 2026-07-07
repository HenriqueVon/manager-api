import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const controllerSpy = vi.fn();

vi.mock('@shared/http/controller.adapter', () => {
  return {
    controllerAdapter: () => {
      return async (req: any, res: any) => {
        controllerSpy(req);
        return res.status(200).json({ ok: true });
      };
    },
  };
});

import financialCurrencyRouter from '../financial-currency.routes';

describe('FinancialCurrency routes (validateRequest + wiring)', () => {
  let app: express.Express;

  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial-currencies', financialCurrencyRouter);
  });

  describe('POST /financial-currencies', () => {
    it('should return 400 when name is too short', async () => {
      const res = await request(app)
        .post('/financial-currencies')
        .send({ name: 'EU', symbol: 'EUR' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid body');
      expect(res.body.issues.some((i: any) => i.path === 'name')).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when symbol is missing', async () => {
      const res = await request(app)
        .post('/financial-currencies')
        .send({ name: 'EURO' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid body');
      expect(res.body.issues.some((i: any) => i.path === 'symbol')).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are sent', async () => {
      const res = await request(app)
        .post('/financial-currencies')
        .send({ name: 'EURO', symbol: 'EUR', extra: 'nope' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should pass validation and call controller on valid body', async () => {
      const res = await request(app)
        .post('/financial-currencies')
        .send({ name: 'EURO', symbol: 'EUR' });

      expect(res.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /financial-currencies/:id', () => {
    it('should return 400 when body is empty', async () => {
      const res = await request(app)
        .patch(`/financial-currencies/${validCuid}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid body');
      expect(res.body.issues.some((i: any) => i.path === '')).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when id is invalid', async () => {
      const res = await request(app)
        .patch('/financial-currencies/123')
        .send({ symbol: 'EUR' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid params');
      expect(
        res.body.issues.some((i: any) => i.path === 'id' && i.message === 'Invalid id')
      ).toBe(true);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should pass validation and call controller when updating only name', async () => {
      const res = await request(app)
        .patch(`/financial-currencies/${validCuid}`)
        .send({ name: 'DOLLAR' });

      expect(res.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });

    it('should pass validation and call controller when updating only symbol', async () => {
      const res = await request(app)
        .patch(`/financial-currencies/${validCuid}`)
        .send({ symbol: 'USD' });

      expect(res.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });
  });
});