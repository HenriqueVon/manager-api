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

describe('GET /financial/entries/summary', () => {
  let app: express.Express;

  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';
  const otherCuid = 'ckl8p2x1a0001x8kq3b0c9a1z';

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial/entries', financialEntryRouter);
  });

  it('should call the summary controller, not getById', async () => {
    const response = await request(app).get('/financial/entries/summary');

    expect(response.status).toBe(200);
    expect(controllerSpy).toHaveBeenCalledWith('summary', expect.anything());
  });

  it('should accept the ledger, the period and the ids', async () => {
    const response = await request(app)
      .get('/financial/entries/summary')
      .query({ ledgerId: validCuid, dueDateFrom: '2026-11-01', dueDateTo: '2026-11-30', ids: `${validCuid},${otherCuid}` });

    expect(response.status).toBe(200);

    const query = controllerSpy.mock.calls[0][1].query;
    expect(query.ids).toEqual([validCuid, otherCuid]);
    expect(query.dueDateFrom).toEqual(new Date('2026-11-01T00:00:00.000Z'));
  });

  it('should accept a type and reject an unknown one', async () => {
    const ok = await request(app).get('/financial/entries/summary').query({ type: 'RECEIVABLE' });
    expect(ok.status).toBe(200);
    expect(controllerSpy.mock.calls[0][1].query.type).toBe('RECEIVABLE');

    const bad = await request(app).get('/financial/entries/summary').query({ type: 'OTHER' });
    expect(bad.status).toBe(400);
  });

  it('should accept paid as true or false and reject any other value', async () => {
    await request(app).get('/financial/entries/summary').query({ paid: 'true' });
    await request(app).get('/financial/entries/summary').query({ paid: 'false' });
    expect(controllerSpy.mock.calls[0][1].query.paid).toBe(true);
    expect(controllerSpy.mock.calls[1][1].query.paid).toBe(false);

    const bad = await request(app).get('/financial/entries/summary').query({ paid: 'yes' });
    expect(bad.status).toBe(400);
  });

  it('should count a repeated id once', async () => {
    await request(app).get('/financial/entries/summary').query({ ids: `${validCuid},${validCuid}` });

    expect(controllerSpy.mock.calls[0][1].query.ids).toEqual([validCuid]);
  });

  it('should reject more than 100 ids', async () => {
    const ids = Array.from({ length: 101 }, (_, index) => `ckl8p2x1a${String(index).padStart(4, '0')}x8kq3b0c9a1z`).join(',');

    const response = await request(app).get('/financial/entries/summary').query({ ids });

    expect(response.status).toBe(400);
    expect(controllerSpy).not.toHaveBeenCalled();
  });

  it('should reject an id that is not valid', async () => {
    const response = await request(app).get('/financial/entries/summary').query({ ids: 'not-a-valid-id' });

    expect(response.status).toBe(400);
  });

  it('should reject an empty ids', async () => {
    const response = await request(app).get('/financial/entries/summary').query({ ids: '' });

    expect(response.status).toBe(400);
  });

  it('should reject a period that ends before it starts', async () => {
    const response = await request(app).get('/financial/entries/summary').query({ dueDateFrom: '2026-12-01', dueDateTo: '2026-11-01' });

    expect(response.status).toBe(400);
  });

  it('should reject pagination and unknown fields', async () => {
    const response = await request(app).get('/financial/entries/summary').query({ limit: 10 });

    expect(response.status).toBe(400);
  });
});
