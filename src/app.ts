import 'reflect-metadata';
import './config/env';
import express from 'express';
import { requestContainerMiddleware } from './shared/http/middlewares/request-container.middleware';

export const app = express();

app.use(express.json());
app.use(requestContainerMiddleware);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'manager-api' });
});
