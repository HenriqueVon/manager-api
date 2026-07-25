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

      return res.status(200).json({
        ok: true,
      });
    };
  },
}));

import financialPaymentMethodRouter from '../financial-payment-method.routes';

describe('FinancialPaymentMethod routes', () => {
  let app: express.Express;

  const validCuid = 'cm1234567890abcdefghijk';

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());

    app.use(
      '/financial-payment-methods',
      financialPaymentMethodRouter
    );
  });

  describe('GET /financial-payment-methods', () => {
    it('should pass validation and call list controller', async () => {
      const response = await request(app).get(
        '/financial-payment-methods'
      );

      expect(response.status).toBe(200);

      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'list',
        expect.anything()
      );
    });
  });

  describe('POST /financial-payment-methods', () => {
    it('should return 400 when name is too short', async () => {
      const response = await request(app)
        .post('/financial-payment-methods')
        .send({
          name: 'A',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');

      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'name' &&
            issue.message ===
              'Name must have at least 2 characters'
        )
      ).toBe(true);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .post('/financial-payment-methods')
        .send({
          name  : 'CASH',
          extra : 'not-allowed',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call create controller when body is valid', async () => {
      const response = await request(app)
        .post('/financial-payment-methods')
        .send({
          name: 'CASH',
        });

      expect(response.status).toBe(200);

      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'create',
        expect.anything()
      );
    });
  });

  describe('GET /financial-payment-methods/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).get(
        '/financial-payment-methods/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');

      expect(
        response.body.issues.some(
          (issue: any) =>
            issue.path === 'id' &&
            issue.message === 'Invalid id'
        )
      ).toBe(true);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call getById controller when id is valid', async () => {
      const response = await request(app).get(
        `/financial-payment-methods/${validCuid}`
      );

      expect(response.status).toBe(200);

      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'getById',
        expect.anything()
      );
    });
  });

  describe('PATCH /financial-payment-methods/:id', () => {
    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .patch(`/financial-payment-methods/${validCuid}`)
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
        .patch('/financial-payment-methods/123')
        .send({
          name: 'CASH',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call update controller when request is valid', async () => {
      const response = await request(app)
        .patch(`/financial-payment-methods/${validCuid}`)
        .send({
          name: 'PIX',
        });

      expect(response.status).toBe(200);

      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'update',
        expect.anything()
      );
    });
  });

  describe('DELETE /financial-payment-methods/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).delete(
        '/financial-payment-methods/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');

      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call delete controller when id is valid', async () => {
      const response = await request(app).delete(
        `/financial-payment-methods/${validCuid}`
      );

      expect(response.status).toBe(200);

      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'delete',
        expect.anything()
      );
    });
  });
});