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

      if (method === 'bulkDelete') {
        return res.status(204).send();
      }

      return res.status(200).json({ ok: true });
    };
  },
}));

import router from '../financial-payment-method.routes';

describe('FinancialPaymentMethod bulk delete route', () => {
  let app: express.Express;

  const cuid = (index: number) => `ckl8p2x1a${String(index).padStart(4, '0')}x8kq3b0c9a1z`;

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/records', router);
  });

  it('should call the bulkDelete controller when the ids are valid', async () => {
    const response = await request(app)
      .post('/records/bulk-delete')
      .send({ ids: [cuid(1), cuid(2)] });

    expect(response.status).toBe(204);
    expect(controllerSpy).toHaveBeenCalledWith('bulkDelete', expect.anything());

    const requestReceived = controllerSpy.mock.calls[0][1] as Request;
    expect(requestReceived.body).toEqual({ ids: [cuid(1), cuid(2)] });
  });

  it('should delete a repeated id once', async () => {
    await request(app)
      .post('/records/bulk-delete')
      .send({ ids: [cuid(1), cuid(2), cuid(1)] });

    const requestReceived = controllerSpy.mock.calls[0][1] as Request;
    expect(requestReceived.body.ids).toEqual([cuid(1), cuid(2)]);
  });

  it('should accept from 1 to 100 ids', async () => {
    for (const count of [1, 100]) {
      const response = await request(app)
        .post('/records/bulk-delete')
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
        .post('/records/bulk-delete')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
    }

    expect(controllerSpy).not.toHaveBeenCalled();
  });

  it('should return 400 when extra fields are provided', async () => {
    const response = await request(app)
      .post('/records/bulk-delete')
      .send({ ids: [cuid(1)], extra: 'not-allowed' });

    expect(response.status).toBe(400);
    expect(controllerSpy).not.toHaveBeenCalled();
  });
});
