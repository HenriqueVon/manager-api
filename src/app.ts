import 'reflect-metadata';
import './config/env';
import express from 'express';
import { requestContainerMiddleware } from '@shared/http/middlewares/request-container.middleware';
import { errorHandler } from '@shared/http/middlewares/error-handlers.middleware';
import routes from './routes';
import '@shared/container';

export const app = express();

app.use(express.json());
app.use(requestContainerMiddleware);
app.use(routes);
app.use(errorHandler);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'manager-api' });
});