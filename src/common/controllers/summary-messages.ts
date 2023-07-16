export class SummaryMessages {
    static readonly apiOperationGetAll  = (entity: string): string => `Get all ${entity}.`;
    static readonly apiOperationGetById = (entity: string): string => `Get one ${entity} by id.`;
    static readonly apiOperationCreate  = (entity: string): string => `Create one ${entity}.`;
    static readonly apiOperationUpdate  = (entity: string): string => `Update a ${entity}.`;
    static readonly apiOperationDelete  = (entity: string): string => `Delete one ${entity}.`;

    //API Responses
    static readonly apiOkResponse         = `Ok.`;
    static readonly apiCreatedResponse    = `Created.`;
    static readonly apiNoContentResponse  = `No Content.`;
    static readonly apiBadRequestResponse = `Bad Request.`;
    static readonly apiConflictResponse   = (entity: string): string => `The ${entity} already exists.`;
    static readonly apiNotFoundResponse   = `Not found.`;
    
    //API Params
    static readonly apiParamIdUuId = (entity: string): string => `The UUID of the ${entity} that exists in the database.`;
  }