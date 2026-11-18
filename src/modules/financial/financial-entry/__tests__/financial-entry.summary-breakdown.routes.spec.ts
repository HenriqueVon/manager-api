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
      return res.status(200).json({ ok: true });
    };
  },
}));

import financialEntryRouter from '../financial-entry.routes';

describe('GET /financial/entries/summary/* (breakdowns)', () => {
  let app: express.Express;

  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial/entries', financialEntryRouter);
  });

  describe.each([
    ['/financial/entries/summary/by-month', 'summaryByMonth'],
    ['/financial/entries/summary/by-category', 'summaryByCategory'],
  ])('%s', (path, action) => {
    it('should call its own controller action, not getById', async () => {
      const response = await request(app).get(path);

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith(action, expect.anything());
    });

    it('should accept the ledger, the type, the period and paid', async () => {
      const response = await request(app)
        .get(path)
        .query({ ledgerId: validCuid, type: 'PAYABLE', dueDateFrom: '2026-01-01', dueDateTo: '2026-12-31', paid: 'false' });

      expect(response.status).toBe(200);

      const query = controllerSpy.mock.calls[0][1].query;
      expect(query.type).toBe('PAYABLE');
      expect(query.paid).toBe(false);
      expect(query.dueDateFrom).toEqual(new Date('2026-01-01T00:00:00.000Z'));
    });

    it('should reject ids, pagination and an unknown paid', async () => {
      expect((await request(app).get(path).query({ ids: validCuid })).status).toBe(400);
      expect((await request(app).get(path).query({ limit: 10 })).status).toBe(400);
      expect((await request(app).get(path).query({ paid: 'maybe' })).status).toBe(400);
      expect((await request(app).get(path).query({ search: 'light' })).status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should reject a period that ends before it starts', async () => {
      const response = await request(app).get(path).query({ dueDateFrom: '2026-12-01', dueDateTo: '2026-11-01' });

      expect(response.status).toBe(400);
    });
  });

  describe('/financial/entries/summary/aging', () => {
    it('should call the aging controller action', async () => {
      const response = await request(app).get('/financial/entries/summary/aging').query({ ledgerId: validCuid, type: 'RECEIVABLE' });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('aging', expect.anything());
      expect(controllerSpy.mock.calls[0][1].query.type).toBe('RECEIVABLE');
    });

    it('should reject a period, paid and an unknown type', async () => {
      expect((await request(app).get('/financial/entries/summary/aging').query({ dueDateFrom: '2026-01-01' })).status).toBe(400);
      expect((await request(app).get('/financial/entries/summary/aging').query({ paid: 'true' })).status).toBe(400);
      expect((await request(app).get('/financial/entries/summary/aging').query({ type: 'OTHER' })).status).toBe(400);
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });
});
