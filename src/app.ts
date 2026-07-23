import './config/zod-openapi';
import 'reflect-metadata';
import express from 'express';
import { requestContainerMiddleware } from '@shared/http/middlewares/request-container.middleware';
import { apiKeyMiddleware } from '@shared/http/middlewares/api-key.middleware';
import { errorHandler } from '@shared/http/middlewares/error-handlers.middleware';
import routes from './routes';
import '@shared/container';
import { env } from './config/env';
import openApiRoutes from '@docs/openapi/openapi.routes';

export const app = express();

app.use(express.json());
app.use(requestContainerMiddleware); 

if (env.nodeEnv !== 'production') {
  app.use('/docs', openApiRoutes);
}

// Global API key enforcement – all endpoints are protected
app.use(apiKeyMiddleware); 
app.use(routes);
app.use(errorHandler);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'manager-api' });
});