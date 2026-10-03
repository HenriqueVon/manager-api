import { Router, type RequestHandler } from 'express';
import swaggerUi from 'swagger-ui-express';
import { createOpenApiDocument } from './document';

type OpenApiDocument = ReturnType<typeof createOpenApiDocument>;

let openApiDocument: OpenApiDocument | undefined;
let swaggerUiHandler: RequestHandler | undefined;

// The document is generated on first use, so startup does not pay
// for it when the docs router is not mounted
function getOpenApiDocument(): OpenApiDocument {
  openApiDocument ??= createOpenApiDocument();
  return openApiDocument;
}

const router = Router();

router.get('/openapi.json', (_req, res) => {
  return res.status(200).json(getOpenApiDocument());
});

const swaggerUiSetup: RequestHandler = (req, res, next) => {
  swaggerUiHandler ??= swaggerUi.setup(getOpenApiDocument(), {
    customSiteTitle : 'Manager API Documentation',
    swaggerOptions  : {
      persistAuthorization   : true,
      displayRequestDuration : true,
      filter                 : true,
      tryItOutEnabled        : true,
    },
  });

  return swaggerUiHandler(req, res, next);
};

router.use('/', swaggerUi.serve, swaggerUiSetup);

export default router;
