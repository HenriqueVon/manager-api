export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}


export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, message, 'BAD_REQUEST');
  } 
}

export class Unauthorized extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class Forbidden extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message, 'CONFLICT');
  }
}

// An error answered by the authentication API, relayed with its own status and code.
// retryAfter (seconds) comes from the Retry-After header of a 429.
export class UpstreamAuthError extends AppError {
  constructor(
    statusCode: number,
    message: string,
    code?: string,
    public readonly retryAfter?: number
  ) {
    super(statusCode, message, code);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = 'Payload too large') {
    super(413, message, 'PAYLOAD_TOO_LARGE');
  }
}
