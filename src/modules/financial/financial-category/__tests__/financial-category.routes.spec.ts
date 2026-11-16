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

  const validId = 'cm1234567890abcdefghijkl';

  const validBody = {
    name             : 'SUPERMARKET',
    type             : 'EXPENSE',
    balance          : 0,
    ledgerId         : 'cm1234567890abcdefghijkl',
    parentCategoryId : 'cm0987654321zyxwvutsrqpo',
  };

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial/categories', financialCategoryRouter);
  });

  describe('GET /financial/categories', () => {
    it('should call the list controller when the query is valid', async () => {
      const response = await request(app)
        .get('/financial/categories')
        .query({
          limit          : '10',
          offset         : '5',
          orderBy        : 'id',
          orderDirection : 'desc',
        });

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('list', expect.anything());

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toMatchObject({ limit: 10, offset: 5 });
    });

    it('should return 400 when orderBy is not a sortable field', async () => {
      const response = await request(app)
        .get('/financial/categories')
        .query({ orderBy: 'notAField' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should convert the filters to their field types', async () => {
      const response = await request(app)
        .get('/financial/categories')
        .query({
          name     : 'SUPERMARKET',
          ledgerId : 'cm1234567890abcdefghijkl',
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toEqual({
        name     : 'SUPERMARKET',
        ledgerId : 'cm1234567890abcdefghijkl',
      });
    });

    it('should trim the search term', async () => {
      const response = await request(app)
        .get('/financial/categories')
        .query({ search: '  term  ' });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toEqual({ search: 'term' });
    });

    it('should return 400 when the search term is longer than 100 characters', async () => {
      const response = await request(app)
        .get('/financial/categories')
        .query({ search: 'x'.repeat(101) });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/categories', () => {
    it('should call the create controller when the body is valid', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledWith('create', expect.anything());
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          type             : 'EXPENSE',
          balance          : 0,
          ledgerId         : 'cm1234567890abcdefghijkl',
          parentCategoryId : 'cm0987654321zyxwvutsrqpo',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should default balance to 0', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          name             : 'SUPERMARKET',
          type             : 'EXPENSE',
          ledgerId         : 'cm1234567890abcdefghijkl',
          parentCategoryId : 'cm0987654321zyxwvutsrqpo',
        });

      expect(response.status).toBe(201);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body.balance).toBe(0);
    });

    it('should return 400 when name is longer than 100 characters', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          name             : 'x'.repeat(101),
          type             : 'EXPENSE',
          balance          : 0,
          ledgerId         : 'cm1234567890abcdefghijkl',
          parentCategoryId : 'cm0987654321zyxwvutsrqpo',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when name is shorter than 3 characters', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          name             : 'x'.repeat(2),
          type             : 'EXPENSE',
          balance          : 0,
          ledgerId         : 'cm1234567890abcdefghijkl',
          parentCategoryId : 'cm0987654321zyxwvutsrqpo',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when type is not a FinancialCategoryType value', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({
          name             : 'SUPERMARKET',
          type             : 'NOT_A_VALUE',
          balance          : 0,
          ledgerId         : 'cm1234567890abcdefghijkl',
          parentCategoryId : 'cm0987654321zyxwvutsrqpo',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the body has an unknown field', async () => {
      const response = await request(app)
        .post('/financial/categories')
        .send({ ...validBody, unknownField: 'not allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /financial/categories/:id', () => {
    it('should call the getById controller when the id is valid', async () => {
      const response = await request(app).get(`/financial/categories/${validId}`);

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('getById', expect.anything());
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app).get('/financial/categories/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /financial/categories/:id', () => {
    it('should call the update controller with only the provided fields', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validId}`)
        .send({ name: 'SUPERMARKET' });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body).toEqual({ name: 'SUPERMARKET' });
    });

    it('should return 400 when the body is empty', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(response.body.issues).toContainEqual(
        expect.objectContaining({ message: 'At least one field must be provided' })
      );
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the body has an unknown field', async () => {
      const response = await request(app)
        .patch(`/financial/categories/${validId}`)
        .send({ name: 'SUPERMARKET', unknownField: 'not allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app)
        .patch('/financial/categories/123')
        .send({ name: 'SUPERMARKET' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /financial/categories/:id', () => {
    it('should call the delete controller when the id is valid', async () => {
      const response = await request(app).delete(`/financial/categories/${validId}`);

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('delete', expect.anything());
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app).delete('/financial/categories/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });
});
