// app must be imported first: it loads the Zod OpenAPI extension used by the docs modules
import { app } from './app';
import express from 'express';
import openApiRoutes from '@docs/openapi/openapi.routes';
import { env } from './config/env';

// The docs are served only by the local server, so the Lambda bundle (handler.ts) does not
// include them. They are mounted on an outer server, before the app's API key and auth middlewares.
const server = express();

if (env.nodeEnv !== 'production' && env.docsEnabled === 'true') {
  server.use('/docs', openApiRoutes);
}

server.use(app);

server.listen(env.app.port, () => {
  console.info(`http://localhost:${env.app.port}`);
});
