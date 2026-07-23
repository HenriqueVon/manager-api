import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiDocument } from './document';

const openApiDocument = createOpenApiDocument();
const router = Router();

router.get('/openapi.json', (_req, res) => {
  return res.status(200).json(openApiDocument);
});

router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle : 'Manager API Documentation',
    swaggerOptions  : {
      persistAuthorization   : true,
      displayRequestDuration : true,
      filter                 : true,
      tryItOutEnabled        : true,
    },
  })
);

export default router;