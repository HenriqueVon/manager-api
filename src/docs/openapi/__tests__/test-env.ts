// Side-effect module: must be imported before anything that imports src/config/env.ts,
// which requires these variables at load time. Variables already set in the shell are kept;
// a local .env file is not used for them because dotenv does not override existing values.
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5432/test';
process.env.API_KEY ??= 'test-api-key';
process.env.AUTH_API_URL ??= 'http://localhost';
