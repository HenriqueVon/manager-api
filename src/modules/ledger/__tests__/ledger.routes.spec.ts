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

import ledgerRouter from '../ledger.routes';

describe('Ledger routes (validateRequest + wiring)', () => {
  let app: express.Express;

  // hardcoded valid CUID for tests
  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/ledgers', ledgerRouter);
  });

  describe('POST /ledgers', () => {
    it('should return 400 (Invalid body) when name is too short', async () => {
      const res = await request(app)
        .post('/ledgers')
        .send({ name: 'abcd', type: 'FIAT' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid body');
      expect(Array.isArray(res.body.issues)).toBe(true);
      expect(res.body.issues.some((i: any) => i.path === 'name')).toBe(true);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 (Invalid body) when extra fields are sent (strict schema)', async () => {
      const res = await request(app)
        .post('/ledgers')
        .send({ name: 'EUROPE', type: 'FIAT', extra: 'nope' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid body');
      expect(Array.isArray(res.body.issues)).toBe(true);
      expect(res.body.issues.length).toBeGreaterThan(0);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should pass validation and call controller on valid body', async () => {
      const res = await request(app)
        .post('/ledgers')
        .send({ name: 'EUROPE', type: 'FIAT' });

      expect(res.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('PATCH /ledgers/:id', () => {
    it('should return 400 (Invalid body) when body is empty (refine rule)', async () => {
      const res = await request(app)
        .patch(`/ledgers/${validCuid}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid body');
      expect(Array.isArray(res.body.issues)).toBe(true);

      // refine error usually goes to root path => ''
      expect(res.body.issues.some((i: any) => i.path === '')).toBe(true);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 (Invalid params) when id is invalid', async () => {
      const res = await request(app)
        .patch('/ledgers/123')
        .send({ type: 'CRYPTO' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid params');
      expect(Array.isArray(res.body.issues)).toBe(true);

      // Your idSchema: z.cuid({ error: 'Invalid id' })
      expect(res.body.issues.some((i: any) => i.path === 'id' && i.message === 'Invalid id')).toBe(
        true
      );

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should pass validation and call controller when updating only type', async () => {
      const res = await request(app)
        .patch(`/ledgers/${validCuid}`)
        .send({ type: 'CRYPTO' });

      expect(res.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });

    it('should pass validation and call controller when updating only name', async () => {
      const res = await request(app)
        .patch(`/ledgers/${validCuid}`)
        .send({ name: 'AFRICA' });

      expect(res.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });
  });
});