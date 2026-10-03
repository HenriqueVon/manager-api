import './config/zod-openapi';
import 'reflect-metadata';
import express from 'express';
import { 
  requestContainerMiddleware, 
  apiKeyMiddleware, 
  errorHandler,
  authMiddleware
} from '@shared/http/middlewares/';
import routes from './routes';
import '@shared/container';

export const app = express();

app.use(express.json());
app.use(requestContainerMiddleware);

app.use(apiKeyMiddleware); // Global API key enforcement – all endpoints are protected
app.use(authMiddleware); // Global authentication enforcement – all endpoints are protected
app.use(routes);
app.use(errorHandler);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'manager-api' });
});