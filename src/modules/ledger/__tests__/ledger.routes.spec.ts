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

import ledgerRouter from '../ledger.routes';

describe('Ledger routes', () => {
  let app: express.Express;

  const validId = 'cm1234567890abcdefghijkl';

  const validBody = {
    name : 'EUROPE',
    type : 'FIAT',
  };

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/ledgers', ledgerRouter);
  });

  describe('GET /ledgers', () => {
    it('should call the list controller when the query is valid', async () => {
      const response = await request(app)
        .get('/ledgers')
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
        .get('/ledgers')
        .query({ orderBy: 'notAField' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should convert the filters to their field types', async () => {
      const response = await request(app)
        .get('/ledgers')
        .query({
          name: 'EUROPE',
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toEqual({
        name: 'EUROPE',
      });
    });

    it('should trim the search term', async () => {
      const response = await request(app)
        .get('/ledgers')
        .query({ search: '  term  ' });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toEqual({ search: 'term' });
    });

    it('should return 400 when the search term is longer than 100 characters', async () => {
      const response = await request(app)
        .get('/ledgers')
        .query({ search: 'x'.repeat(101) });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /ledgers', () => {
    it('should call the create controller when the body is valid', async () => {
      const response = await request(app)
        .post('/ledgers')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledWith('create', expect.anything());
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/ledgers')
        .send({
          type: 'FIAT',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when name is longer than 100 characters', async () => {
      const response = await request(app)
        .post('/ledgers')
        .send({
          name : 'x'.repeat(101),
          type : 'FIAT',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when name is shorter than 5 characters', async () => {
      const response = await request(app)
        .post('/ledgers')
        .send({
          name : 'x'.repeat(4),
          type : 'FIAT',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when type is not a LedgerType value', async () => {
      const response = await request(app)
        .post('/ledgers')
        .send({
          name : 'EUROPE',
          type : 'NOT_A_VALUE',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the body has an unknown field', async () => {
      const response = await request(app)
        .post('/ledgers')
        .send({ ...validBody, unknownField: 'not allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /ledgers/:id', () => {
    it('should call the getById controller when the id is valid', async () => {
      const response = await request(app).get(`/ledgers/${validId}`);

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('getById', expect.anything());
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app).get('/ledgers/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /ledgers/:id', () => {
    it('should call the update controller with only the provided fields', async () => {
      const response = await request(app)
        .patch(`/ledgers/${validId}`)
        .send({ name: 'EUROPE' });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body).toEqual({ name: 'EUROPE' });
    });

    it('should return 400 when the body is empty', async () => {
      const response = await request(app)
        .patch(`/ledgers/${validId}`)
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
        .patch(`/ledgers/${validId}`)
        .send({ name: 'EUROPE', unknownField: 'not allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app)
        .patch('/ledgers/123')
        .send({ name: 'EUROPE' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /ledgers/:id', () => {
    it('should call the delete controller when the id is valid', async () => {
      const response = await request(app).delete(`/ledgers/${validId}`);

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('delete', expect.anything());
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app).delete('/ledgers/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });
});
