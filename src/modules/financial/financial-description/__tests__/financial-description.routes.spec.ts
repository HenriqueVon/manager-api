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

import financialDescriptionRouter from '../financial-description.routes';

describe('FinancialDescription routes', () => {
  let app: express.Express;

  const validId = 'cm1234567890abcdefghijkl';

  const validBody = {
    description: 'SUPERMARKET',
  };

  beforeEach(() => {
    controllerSpy.mockClear();

    app = express();
    app.use(express.json());
    app.use('/financial/descriptions', financialDescriptionRouter);
  });

  describe('GET /financial/descriptions', () => {
    it('should call the list controller when the query is valid', async () => {
      const response = await request(app)
        .get('/financial/descriptions')
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
        .get('/financial/descriptions')
        .query({ orderBy: 'notAField' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should convert the filters to their field types', async () => {
      const response = await request(app)
        .get('/financial/descriptions')
        .query({
          description: 'SUPERMARKET',
        });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toEqual({
        description: 'SUPERMARKET',
      });
    });

    it('should trim the search term', async () => {
      const response = await request(app)
        .get('/financial/descriptions')
        .query({ search: '  term  ' });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.query).toEqual({ search: 'term' });
    });

    it('should return 400 when the search term is longer than 100 characters', async () => {
      const response = await request(app)
        .get('/financial/descriptions')
        .query({ search: 'x'.repeat(101) });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid query');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('POST /financial/descriptions', () => {
    it('should call the create controller when the body is valid', async () => {
      const response = await request(app)
        .post('/financial/descriptions')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(controllerSpy).toHaveBeenCalledWith('create', expect.anything());
    });

    it('should return 400 when description is missing', async () => {
      const response = await request(app)
        .post('/financial/descriptions')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when description is longer than 100 characters', async () => {
      const response = await request(app)
        .post('/financial/descriptions')
        .send({
          description: 'x'.repeat(101),
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when description is shorter than 3 characters', async () => {
      const response = await request(app)
        .post('/financial/descriptions')
        .send({
          description: 'x'.repeat(2),
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the body has an unknown field', async () => {
      const response = await request(app)
        .post('/financial/descriptions')
        .send({ ...validBody, unknownField: 'not allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('GET /financial/descriptions/:id', () => {
    it('should call the getById controller when the id is valid', async () => {
      const response = await request(app).get(`/financial/descriptions/${validId}`);

      expect(response.status).toBe(200);
      expect(controllerSpy).toHaveBeenCalledWith('getById', expect.anything());
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app).get('/financial/descriptions/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /financial/descriptions/:id', () => {
    it('should call the update controller with only the provided fields', async () => {
      const response = await request(app)
        .patch(`/financial/descriptions/${validId}`)
        .send({ description: 'SUPERMARKET' });

      expect(response.status).toBe(200);

      const requestReceived = controllerSpy.mock.calls[0][1] as Request;

      expect(requestReceived.body).toEqual({ description: 'SUPERMARKET' });
    });

    it('should return 400 when the body is empty', async () => {
      const response = await request(app)
        .patch(`/financial/descriptions/${validId}`)
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
        .patch(`/financial/descriptions/${validId}`)
        .send({ description: 'SUPERMARKET', unknownField: 'not allowed' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid body');
      expect(controllerSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app)
        .patch('/financial/descriptions/123')
        .send({ description: 'SUPERMARKET' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /financial/descriptions/:id', () => {
    it('should call the delete controller when the id is valid', async () => {
      const response = await request(app).delete(`/financial/descriptions/${validId}`);

      expect(response.status).toBe(204);
      expect(controllerSpy).toHaveBeenCalledWith('delete', expect.anything());
    });

    it('should return 400 when the id is invalid', async () => {
      const response = await request(app).delete('/financial/descriptions/123');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid params');
      expect(controllerSpy).not.toHaveBeenCalled();
    });
  });
});
