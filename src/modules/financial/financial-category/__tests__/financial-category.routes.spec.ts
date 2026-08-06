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

import financialCategoryRouter from '../financial-category.routes';

describe('FinancialCategory routes', () => {
  let app: express.Express;

  const validCuid = 'ckl8p2x1a0000x8kq3b0c9a1z';
  const parentCuid = 'ckl8p2x1a0001x8kq4b0c9a2z';

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial/categories', financialCategoryRouter);
  });

  describe('GET /financial/categories', () => {
    it('should call list controller', async () => {
      const response = await request(app).get('/financial/categories');

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'list',
        expect.anything()
      );
    });
  });

  describe('POST /financial/categories', () => {
    const validBody = {
      name             : 'SUPERMARKET',
      type             : 'EXPENSE',
      balance          : 100,
      ledgerId         : validCuid,
      parentCategoryId : parentCuid,
    };

    it('should return 400 when name is too short', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          ...validBody,
          name: 'AB',
        });

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
        .post('/financial/categories')
        .send({
          ...validBody,
          type: 'INVALID',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) => issue.path === 'type'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when ledgerId is missing', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ledgerId: _ledgerId, ...bodyWithoutLedger } = validBody;

      const response = await request(app)
        .post('/financial/categories')
        .send(bodyWithoutLedger);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(
        response.body.issues.some(
          (issue: any) => issue.path === 'ledgerId'
        )
      ).toBe(true);
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should accept null parentCategoryId for a root category', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          ...validBody,
          parentCategoryId: null,
        });

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });

    it('should apply default balance before calling create controller', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { balance: _balance, ...bodyWithoutBalance } = validBody;

      const response = await request(app)
        .post('/financial/categories')
        .send(bodyWithoutBalance);

      expect(response.status).toBe(201);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;
      expect(requestReceived.body).toEqual({
        ...bodyWithoutBalance,
        balance: 0,
      });
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          ...validBody,
          extra: 'not-allowed',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call create controller when body is valid', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'create',
        expect.anything()
      );
    });
  });

  describe('GET /financial/categories/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).get(
        '/financial/categories/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call getById controller when id is valid', async () => {
      const response = await request(app).get(
        `/financial/categories/${validCuid}`
      );

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith(
        'getById',
        expect.anything()
      );
    });
  });

  describe('PATCH /financial/categories/:id', () => {
    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validCuid}`)
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
        .patch('/financial/categories/123')
        .send({ balance: 500 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should allow moving a category to another parent', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validCuid}`)
        .send({ parentCategoryId: parentCuid });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith(
        'update',
        expect.anything()
      );
    });

    it('should allow setting parentCategoryId to null', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validCuid}`)
        .send({
          parentCategoryId: null,
        });

      expect(response.status).toBe(200);

      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'update',
        expect.anything()
      );

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body).toEqual({
        parentCategoryId: null,
      });
    });

    it('should return 400 when extra fields are provided', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validCuid}`)
        .send({
          balance : 500,
          extra   : 'not-allowed',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call update controller when request is valid', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validCuid}`)
        .send({
          name    : 'GROCERIES',
          balance : 500,
        });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
      expect(controllerSpy).toHaveBeenCalledWith(
        'update',
        expect.anything()
      );
    });
  });

  describe('DELETE /financial/categories/:id', () => {
    it('should return 400 when id is invalid', async () => {
      const response = await request(app).delete(
        '/financial/categories/123'
      );

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should call delete controller when id is valid', async () => {
      const response = await request(app).delete(
        `/financial/categories/${validCuid}`
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
