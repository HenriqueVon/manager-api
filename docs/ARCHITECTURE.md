# Manager API Architecture

This document describes how the Manager API is structured **today**, based on the current source code. It is descriptive, not prescriptive: it records the patterns the code actually follows, including their exceptions and known inconsistencies. Problems are listed only in [Section 15](#15-known-architectural-inconsistencies) and are not resolved here.

---

## 1. System Overview

### Purpose

The Manager API is a REST API for managing personal finance records. It exposes CRUD operations for:

| Resource | Base path | Module |
|---|---|---|
| Ledgers | `/v1/api/ledgers` | [`src/modules/ledger`](../src/modules/ledger) |
| Currencies | `/v1/api/financial/currencies` | [`financial-currency`](../src/modules/financial/financial-currency) |
| Descriptions | `/v1/api/financial/descriptions` | [`financial-description`](../src/modules/financial/financial-description) |
| Payment methods | `/v1/api/financial/payment-methods` | [`financial-payment-method`](../src/modules/financial/financial-payment-method) |
| Bank accounts | `/v1/api/financial/bank-accounts` | [`financial-bank-account`](../src/modules/financial/financial-bank-account) |
| Funds | `/v1/api/financial/funds` | [`financial-fund`](../src/modules/financial/financial-fund) |
| Fund transactions | `/v1/api/financial/funds/transactions` | [`financial-fund-transaction`](../src/modules/financial/financial-fund-transaction) |
| Categories (hierarchical) | `/v1/api/financial/categories` | [`financial-category`](../src/modules/financial/financial-category) |
| Entries (payable / receivable) | `/v1/api/financial/entries` | [`financial-entry`](../src/modules/financial/financial-entry) |

A `Ledger` is the parent record for bank accounts, funds, categories, entries and fund transactions. Currencies, descriptions and payment methods are global catalogs (not scoped to a ledger).

### Stack

| Concern | Technology |
|---|---|
| Language | TypeScript (CommonJS, `strict`, decorators + `emitDecoratorMetadata`) — [`tsconfig.json`](../tsconfig.json) |
| HTTP framework | Express 4 |
| Dependency injection | tsyringe + `reflect-metadata` |
| Validation | Zod 4 |
| API docs | `@asteasolutions/zod-to-openapi` + `swagger-ui-express` |
| ORM / database | Prisma 7 with `@prisma/adapter-pg` on PostgreSQL |
| Tests | Vitest + Supertest |
| Lint | ESLint + typescript-eslint — [`eslint.config.mjs`](../eslint.config.mjs) |

### Runtime and entry points

| Entry point | Role |
|---|---|
| [`src/app.ts`](../src/app.ts) | Builds the Express app (global middleware, docs, routes, error handler, `/health`). |
| [`src/handler.ts`](../src/handler.ts) | AWS Lambda handler: `serverless(app)` via `serverless-http`. |
| [`src/local.ts`](../src/local.ts) | Local server used by `npm run dev`: an outer Express server that mounts `/docs` (when enabled) and then `app`, listening on `env.app.port`. |

### Deployment

- [`serverless.yml`](../serverless.yml) deploys a **single Lambda function** (`api`, Node 24, `sa-east-1`) bundled with esbuild. It receives every request through HTTP API routes `/` and `/{proxy+}`.
- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) runs a `validate` job (`npm ci`, `prisma generate`, lint, `tsc --noEmit`, tests). It then deploys `develop` → `dev` stage and `main` → `prod` stage.
- The workflow does not run Prisma migrations.

### General organization

```
src/
├── app.ts / handler.ts / local.ts / routes.ts
├── config/      env.ts (environment variables), zod-openapi.ts (Zod extension)
├── docs/openapi OpenAPI registry, document generation, Swagger UI router
├── services/    auth (external token validation), database/prisma (client, schema, migrations)
├── shared/      container (DI composition root), http (adapter + middlewares),
│                errors, database (prismaCall), dtos, schemas, security, types
├── modules/     ledger/ and financial/<feature>/ — one folder per resource
└── test/        setup.ts
```

Path aliases (`@modules`, `@services`, `@shared`, `@config`, `@docs`) are defined in [`tsconfig.json`](../tsconfig.json).

---

## 2. High-Level Architecture

```
HTTP Request
  → Global middleware        (express.json, request container, API key, authentication)
  → Route                    (src/routes.ts → <module>.routes.ts)
  → Validation               (validateRequest + module Zod schemas)
  → Controller               (resolved per request by controllerAdapter)
  → Use Case                 (one class per operation, execute())
  → Repository Interface     (I<Module>Repository, injected by string token)
  → Repository Implementation (<Module>Repository, registered as singleton)
  → Prisma                   (shared PrismaClient singleton)
  → PostgreSQL
```

| Step | What happens | Main files |
|---|---|---|
| Middleware | Cross-cutting concerns applied to every request in registration order. | [`src/app.ts`](../src/app.ts), [`src/shared/http/middlewares/`](../src/shared/http/middlewares) |
| Route | Mounts each module router under `/v1/api/...`. | [`src/routes.ts`](../src/routes.ts) |
| Validation | Parses `params`, `query` and `body` with Zod and **replaces** them with the parsed output. Returns 400 on failure. | [`validate.middleware.ts`](../src/shared/http/middlewares/validate.middleware.ts) |
| Controller | Maps the Express request to a use case call and sets the HTTP status. | `<module>.controller.ts` |
| Use Case | Holds the application logic for a single operation. | `usecases/*.usecase.ts` |
| Repository Interface | TypeScript contract consumed by use cases. | `repositories/i<module>.repository.ts` |
| Repository Implementation | Performs Prisma queries. | `repositories/<module>.repository.ts` |
| Prisma | One `PrismaClient` with the PostgreSQL driver adapter. | [`prisma.client.ts`](../src/services/database/prisma/prisma.client.ts) |

The flow is linear. No events, queues, background jobs or database transactions exist, and no use case calls another use case or another module.

---

## 3. Module Structure

All nine modules have the **same set of source files**, differing only in the module name. Ledger lives at `src/modules/ledger`. The other eight live under `src/modules/financial/`.

Example ([`financial-fund`](../src/modules/financial/financial-fund)):

```
src/modules/financial/financial-fund/
├── financial-fund.routes.ts
├── financial-fund.controller.ts
├── financial-fund.openapi.ts
├── dtos/
│   ├── create-financial-fund.dto.ts
│   ├── update-financial-fund.dto.ts
│   └── index.ts
├── schemas/
│   ├── create-financial-fund.schema.ts
│   ├── update-financial-fund.schema.ts
│   ├── list-financial-fund-query.schema.ts
│   ├── financial-fund.schema.ts                 # response/entity schema (docs)
│   ├── list-financial-fund-response.schema.ts   # paginated response schema (docs)
│   └── index.ts
├── usecases/
│   ├── create-financial-fund.usecase.ts
│   ├── update-financial-fund.usecase.ts
│   ├── list-financial-fund.usecase.ts
│   ├── get-by-id-financial-fund.usecase.ts
│   ├── delete-financial-fund.usecase.ts
│   └── index.ts
├── repositories/
│   ├── ifinancial-fund.repository.ts            # interface
│   ├── financial-fund.repository.ts             # Prisma implementation
│   └── financial-fund.tokens.ts                 # DI token
└── __tests__/
    ├── financial-fund.routes.spec.ts
    └── usecases/*.usecase.spec.ts
```

### Responsibilities

**Routes** (`<module>.routes.ts`)
- Define exactly five endpoints: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`.
- Each endpoint is `validateRequest({...})` followed by `controllerAdapter(Controller, 'method')`.

**Controllers** (`<module>.controller.ts`)
- `@injectable()` classes whose constructor injects the module's five use case classes.
- Methods `create` (201), `list` (200), `getById` (200), `update` (200), `delete` (204, no body).
- They return the use case result as JSON.
- `list` builds a `ListParamsDto` from `req.query`.

**Schemas** (`schemas/`)
- Zod schemas for create body, update body and list query; these are used by validation.
- Entity (response) and list-response schemas, which are used only by OpenAPI and the OpenAPI tests.

**DTOs** (`dtos/`)
- `CreateXDto` and `UpdateXDto`, defined as `z.infer<typeof schema>`.

**Use cases** (`usecases/`)
- One `@injectable()` class per operation with a single `execute()` method.
- Each depends on one repository interface.

**Repository interface** (`repositories/i<module>.repository.ts`)
- Declares `create`, `findById`, `findMany`, `update`, `delete`, `exists`.
- Some modules also declare `findByName` or `findByDescription`.
- Types are Prisma models and module DTOs.

**Repository implementation** (`repositories/<module>.repository.ts`)
- `@injectable()` class implementing the interface with the shared `prisma` client.

**Token** (`repositories/<module>.tokens.ts`)
- String constant used as the DI key, e.g. `export const LEDGER_REPOSITORY = 'LedgerRepository' as const;`.

**OpenAPI** (`<module>.openapi.ts`)
- Side-effect module that registers the module's input schemas and its five paths in the shared OpenAPI registry, using the shared error responses from [`docs/openapi/responses.ts`](../src/docs/openapi/responses.ts).

**Tests** (`__tests__/`)
- Route validation spec and use case unit specs (see [Section 12](#12-testing-architecture)).

---

## 4. Request Lifecycle

Traced for `POST /v1/api/financial/funds/transactions`. Every module follows the same path.

1. **Entry.** In Lambda, [`handler.ts`](../src/handler.ts) adapts the event into Express. Locally, [`local.ts`](../src/local.ts) listens on `PORT` with an outer Express server; when `env.nodeEnv !== 'production'` and `env.docsEnabled === 'true'` it serves `/docs` first (before the API key check), then delegates everything to `app`. The Lambda never serves `/docs`.

2. **Global middleware**, in the order registered in [`app.ts`](../src/app.ts):
   1. `express.json()`.
   2. **Request container:** [`requestContainerMiddleware`](../src/shared/http/middlewares/request-container.middleware.ts) sets `req.requestId` (random UUID if absent) and `req.container = container.createChildContainer()`.
   3. **API key:** [`apiKeyMiddleware`](../src/shared/http/middlewares/api-key.middleware.ts) reads `x-api-key`. It throws `Unauthorized` (401) if the header is missing and `Forbidden` (403) if it does not match `env.apiKey`, using a timing-safe comparison ([`safe-compare.ts`](../src/shared/security/safe-compare.ts)).
   4. **Authentication:** [`authMiddleware`](../src/shared/http/middlewares/auth.middleware.ts) creates `new AuthService()` and calls `authenticate(req.header('authorization'))`. It expects `Bearer <token>` and validates it via HTTP against `${AUTH_API_URL}/auth/validate` ([`auth.service.ts`](../src/services/auth/auth.service.ts)).

3. **Routing.** [`routes.ts`](../src/routes.ts) dispatches to `financialFundTransactionRoute`. This router is mounted **before** `/financial/funds`, so the funds router's `/:id` route does not capture `transactions`.

4. **Validation.** `validateRequest({ body: createFinancialFundTransactionSchema })` parses the body.
   - On failure it responds `400 { message: 'Invalid body', errors, issues }` directly.
   - On success `req.body` becomes the parsed value (e.g., `transactionDate` becomes a `Date`, missing amounts default to `0`).

5. **Controller resolution.** [`controllerAdapter`](../src/shared/http/controller.adapter.ts) calls `req.container.resolve(FinancialFundTransactionController)`. tsyringe builds the controller and its use cases. Errors thrown by the handler are forwarded with `next(err)`.

6. **Use case.** `CreateFinancialFundTransactionUseCase.execute(input)` applies its rule: the two amounts cannot both be greater than 0, nor both equal to 0. A violation throws `BadRequestError`. Otherwise it calls `repository.create(input)`.

7. **Repository.** `FinancialFundTransactionRepository.create` runs `prismaCall(() => prisma.financialFundTransaction.create({ data }))`.

8. **Database.** Prisma inserts into `financial_fund_transactions`.

9. **Response.** The controller returns `201` with the Prisma record as JSON.

10. **Error handling.** Any error passed to `next` reaches [`errorHandler`](../src/shared/http/middlewares/error-handlers.middleware.ts) (see [Section 9](#9-error-handling)).

Notes:
- `GET /health` is registered after `errorHandler`, and after the API key and authentication middleware. It therefore requires both a valid API key and a valid Bearer token.
- `req.requestId` is set but not read anywhere else in the codebase.

---

## 5. Dependency Direction

### Dependencies used by the current pattern

```
<module>.routes.ts ──► validateRequest, controllerAdapter (shared/http), module schemas, idParamsSchema (shared/schemas)
Controller        ──► Use case classes (concrete)
Use case          ──► I<Module>Repository (type) + token, module DTOs, shared/errors, shared/dtos, @prisma/client types
Repository        ──► prisma client (services/database), prismaCall (shared/database), DTOs, @prisma/client types
Repository iface  ──► @prisma/client types, module DTOs, shared/dtos
DTOs              ──► module Zod schemas (z.infer)
Schemas           ──► zod; @prisma/client enums (ledger, bank-account, category, entry only)
<module>.openapi  ──► docs/openapi/registry, docs/openapi/responses, module schemas, shared/schemas
```

### Cross-cutting dependencies

- [`src/shared/container/index.ts`](../src/shared/container/index.ts) imports the concrete repository, interface and token of **every** module (shared → modules).
- [`src/docs/openapi/modules.ts`](../src/docs/openapi/modules.ts) imports every `<module>.openapi.ts`, and each of those imports [`docs/openapi/registry.ts`](../src/docs/openapi/registry.ts).
- [`src/routes.ts`](../src/routes.ts) imports every module router.

### Module isolation

- No module imports another module, either through `@modules/...` or through relative paths.
- Relationships between resources exist only in the database schema (foreign keys in [`schema.prisma`](../src/services/database/prisma/schema.prisma)).

### Where dependency inversion exists

- **Between use cases and repositories only.** Use cases depend on `I<Module>Repository` and receive the implementation through `@inject(<TOKEN>)`. The binding token → implementation is defined in the composition root ([`shared/container/index.ts`](../src/shared/container/index.ts)).

### Where dependency inversion does not exist

- **Controller → use case:** controllers inject concrete use case classes; there is no interface.
- **Repository → Prisma:** repositories import the `prisma` singleton directly; it is not injected.
- **Authentication:** `authMiddleware` instantiates `AuthService` with `new`.
- **Configuration:** `env` is imported directly ([`config/env.ts`](../src/config/env.ts)). [`prisma.client.ts`](../src/services/database/prisma/prisma.client.ts) reads `process.env` directly instead of `env`.
- **Types across layers:** Prisma model types appear in use cases and repository interfaces, and DTO types are derived from HTTP validation schemas. Use cases and interfaces are therefore typed by the ORM and by the HTTP layer.

---

## 6. Dependency Injection

- **Library.** tsyringe. `reflect-metadata` is imported in [`app.ts`](../src/app.ts) and in the test setup ([`src/test/setup.ts`](../src/test/setup.ts)).

- **Repository tokens.** Each module exports a string token from `repositories/<module>.tokens.ts`. Use cases inject with `@inject(TOKEN)`.

- **Singleton repositories.**
  - [`shared/container/index.ts`](../src/shared/container/index.ts) calls `container.registerSingleton<IXRepository>(TOKEN, XRepository)` for all nine repositories on the **root** container.
  - It is loaded as a side effect by `import '@shared/container'` in `app.ts`.

- **Transient controllers and use cases.**
  - Controllers and use cases are not registered.
  - They are `@injectable()` classes resolved by class token. tsyringe creates a new instance on every resolution.
  - Controllers inject use cases by class (`@inject(CreateLedgerUseCase)`).

- **Child container per request.**
  - [`requestContainerMiddleware`](../src/shared/http/middlewares/request-container.middleware.ts) creates `container.createChildContainer()` for each request.
  - [`controllerAdapter`](../src/shared/http/controller.adapter.ts) resolves the controller from that child container.

- **Current limitation of the request scope.**
  - No registration uses `Lifecycle.ContainerScoped`, `registerScoped` or `ResolutionScoped`.
  - Repositories resolve from the root singletons, and controllers and use cases are transient regardless of the container.
  - The child container therefore does not currently provide per-request instances or state isolation.

- **Outside DI.** `AuthService`, the Prisma client and `env`.

---

## 7. Data and Persistence

### Prisma setup

| Item | Location |
|---|---|
| Schema | [`src/services/database/prisma/schema.prisma`](../src/services/database/prisma/schema.prisma) (`prisma-client-js` generator, PostgreSQL) |
| Migrations | [`src/services/database/prisma/migrations/`](../src/services/database/prisma/migrations), one migration per table plus later alterations |
| Prisma config | [`prisma.config.ts`](../prisma.config.ts) (uses `DATABASE_URL` and `SHADOW_DATABASE_URL`) |

The client lives in [`prisma.client.ts`](../src/services/database/prisma/prisma.client.ts):
- a single `PrismaClient` using `PrismaPg`;
- query logging when `NODE_ENV === 'development'`;
- cached on `global.prisma` outside production.

### Repository pattern

**Only repository implementations import the `prisma` client.** Every repository implements:
- `create(data)` → `prisma.<model>.create`, wrapped in `prismaCall`;
- `findById(id)` → `findUnique({ where: { id } })`;
- `findMany(filters, params)` → paginated query (see below);
- `update(id, data)` → `prisma.<model>.update`, wrapped in `prismaCall`;
- `delete(id)` → `prisma.<model>.delete`, wrapped in `prismaCall`;
- `exists(id)` → `count({ where: { id } }) > 0`;
- in ledger, currency, payment-method and bank-account, `findByName(name)`; in description, `findByDescription(description)`. Both are `findUnique` on the unique column.

All write operations go through `prismaCall`; no read operation does. No repository uses `$transaction` or raw SQL.

### `prismaCall`

[`src/shared/database/prisma/prisma-call.ts`](../src/shared/database/prisma/prisma-call.ts):
- Catches `Prisma.PrismaClientKnownRequestError` and translates two codes:
  - **`P2002`** (unique constraint violation): logs the model and fields, then throws `ConflictError` (409);
  - **`P2025`** (record to update or delete not found): throws `NotFoundError` (404).
- Rethrows every other error unchanged.

### Pagination

- `findMany` uses `limit = Math.min(params.limit ?? 20, 100)` and `offset = params.offset ?? 0`.
- `orderBy = { [params.orderBy]: params.orderDirection ?? 'asc' }` when `orderBy` is given.
- It runs `findMany` and `count` with `Promise.all` and returns `{ items, total }` (`PaginatedResponseDto`).
- The list query schemas also cap `limit` at 100 and restrict `orderBy` to a per-module enum.

**Filters.**
- `findMany` accepts `filters: Partial<Entity>`.
- The list use cases always pass `{}`, so the HTTP list endpoints do not filter.
- Non-empty filters are used only internally by the fund and category use cases for uniqueness checks.
- Prisma ignores filter keys whose value is `undefined`.

### Uniqueness

Every unique constraint in the schema has a corresponding pre-check in the create and update use cases:

| Model | DB constraint | Use case check |
|---|---|---|
| Ledger, FinancialCurrency, FinancialPaymentMethod, FinancialBankAccount | `name @unique` | `findByName(normalizedName)` |
| FinancialDescription | `description @unique` | `findByDescription(normalizedDescription)` |
| FinancialFund | `@@unique([ledgerId, name])` | `findMany({ name, ledgerId }, { limit: 1 })` |
| FinancialCategory | `@@unique([ledgerId, parentCategoryId, name])` | `findMany({ ledgerId, parentCategoryId, name }, { limit: 1 })` |

- The checked value is normalized with `trim().toUpperCase()`.
- The check is a separate query before the write, not atomic with it. Concurrent duplicates fall back to the DB constraint, and `prismaCall` translates that to 409.
- Entries and fund transactions have no business unique constraint.

### Prisma models as application entities

- There is no separate domain or entity layer.
- The Prisma-generated model types (`Ledger`, `FinancialFund`, ...) are used as the return types of repositories and use cases.
- Controllers serialize these records directly as the HTTP response, with no mapping.

---

## 8. Validation and DTOs

**Zod schemas** live in each module's `schemas/` folder. They are applied by [`validateRequest`](../src/shared/http/middlewares/validate.middleware.ts) in the order params → query → body. The parsed output replaces `req.params`, `req.query` and `req.body`.

**Schema shapes** observed across all modules:
- `create<X>Schema`: required fields, `.strict()` (unknown keys → 400).
- `update<X>Schema`: all fields optional, plus `.refine(data => Object.keys(data).length > 0, 'At least one field must be provided')`. Eight of nine use `.strict()`; `updateLedgerSchema` does not.
- `list<X>QuerySchema`: `limit` (`z.coerce.number().int().min(1).max(100)`), `offset` (`min(0)`), `orderBy` (per-module enum), `orderDirection` (`asc`/`desc`), all with `.strict()`.
- `<x>Schema` / `list<X>ResponseSchema`: documentation-only response schemas (see [Section 11](#11-openapi-documentation)). The entity schema lists the Prisma model fields explicitly, typed as they are serialized to JSON, and is named with `.openapi('<X>')`.

**Enums** are taken from `@prisma/client` (e.g., `z.enum(LedgerType)`) in the ledger, bank-account, category and entry schemas.

**Transforms:**
- Date strings are validated with `z.iso.date()` and transformed into `Date`.
  - Entries use `new Date(`${value}T00:00:00.000Z`)`.
  - Fund transactions use `new Date(value)`.
- Numeric defaults use `.optional().default(0)` (e.g., `balance`, `amountCredit`, `amountDebit`, `amountPaid`).

**DTOs via `z.infer`:**
- Every module DTO file is `export type XDto = z.infer<typeof xSchema>`, so a DTO is the parsed output type of its schema.
- Create and update use cases, and the repository `create`/`update` methods, take these DTOs.

**`ListParamsDto`:**
- [`src/shared/dtos/list-params.dto.ts`](../src/shared/dtos/list-params.dto.ts) is a hand-written interface (`limit`, `offset`, `orderBy: string`, `orderDirection`), not inferred from Zod.
- List use cases receive it from the controller, which reads `req.query` with `Number(...)` and type casts.

**`PaginatedResponseDto<T>`** ([`paginated-response.dto.ts`](../src/shared/dtos/paginated-response.dto.ts)) is `{ items: T[]; total: number }`.

**ID validation:**
- [`idParamsSchema`](../src/shared/schemas/id.schema.ts) validates `:id` as a CUID (`z.cuid`, message `'Invalid id'`). It is used on `GET`, `PATCH` and `DELETE /:id` in every module.
- Foreign-key ids in request bodies (`ledgerId`, `financialFundId`, ...) are validated only as `z.string()`.

---

## 9. Error Handling

There are four distinct runtime behaviors.

### Validation errors

- Produced by `validateRequest` **without** going through the error handler.
- Response: `400 { message: 'Invalid params' | 'Invalid query' | 'Invalid body', errors: <zod format()>, issues: [{ path, message, code }] }`.

### AppError

- Defined in [`src/shared/errors/app-error.ts`](../src/shared/errors/app-error.ts): `AppError(statusCode, message, code)` and its subclasses `BadRequestError` (400), `Unauthorized` (401), `Forbidden` (403), `NotFoundError` (404), `ConflictError` (409).
- Where they are thrown:
  - `Unauthorized` / `Forbidden`: API key middleware and `AuthService`.
  - `NotFoundError`: the nine get-by-id use cases, and `prismaCall` (P2025, update or delete of a missing record).
  - `ConflictError`: uniqueness checks in create/update use cases, and `prismaCall` (P2002).
  - `BadRequestError`: the fund-transaction create/update use cases.
- [`errorHandler`](../src/shared/http/middlewares/error-handlers.middleware.ts) logs with `console.warn` and responds `err.statusCode` with `{ message, code }`.

### Prisma errors

- `prismaCall` translates `P2002` to `ConflictError` and `P2025` to `NotFoundError`.
- All other Prisma errors reach `errorHandler` as non-`AppError` errors. This includes foreign-key violations on insert, update or delete.

### Unexpected errors

- Any non-`AppError` is logged with `console.error`.
- Response: `500 { message: 'Internal server error' }`.
- This includes Prisma errors other than P2002/P2025, malformed JSON bodies (the `express.json()` parse error is not an `AppError`) and network failures of the `fetch` call in `AuthService`.

Use cases for update and delete do not check that the record exists before calling the repository; the 404 for a missing record comes from `prismaCall` (P2025).

---

## 10. Authentication and Security Boundary

Every request to `app` passes two global checks, in this order. `/docs` is outside `app`: it is served only by the local server (`local.ts`) and is public there.

1. **API key.** [`apiKeyMiddleware`](../src/shared/http/middlewares/api-key.middleware.ts) requires the `x-api-key` header to equal `API_KEY`, compared with `crypto.timingSafeEqual`.
2. **Bearer token.** [`authMiddleware`](../src/shared/http/middlewares/auth.middleware.ts) delegates to [`AuthService`](../src/services/auth/auth.service.ts), which:
   - requires `Authorization: Bearer <token>`;
   - calls `GET ${env.authApiBaseUrl}/auth/validate` with the same Bearer token (`env.authApiBaseUrl` comes from `AUTH_API_URL`);
   - treats any non-2xx response as `Unauthorized('Invalid or expired token')`;
   - uses no timeout and no caching.

**Identity and authorization (current behavior):**
- The response body of the validation call is not read.
- No user identity is attached to the request.
- No authorization check exists: any request that passes both checks can access every ledger and every resource.

**Configuration:**
- [`config/env.ts`](../src/config/env.ts) requires `DATABASE_URL`, `API_KEY` and `AUTH_API_URL`; a missing value throws at module load.
- `PORT` defaults to 3000, `NODE_ENV` to `development` and `DOCS_ENABLED` to `'false'`.
- [`serverless.yml`](../serverless.yml) forwards only `NODE_ENV`, `DATABASE_URL` and `API_KEY` to the Lambda environment.

---

## 11. OpenAPI Documentation

- **Zod extension.** [`config/zod-openapi.ts`](../src/config/zod-openapi.ts) calls `extendZodWithOpenApi(z)`. It is imported first in `app.ts` and is a Vitest setup file.
- **Registry.** [`docs/openapi/registry.ts`](../src/docs/openapi/registry.ts) exports a single `OpenAPIRegistry` and registers two security schemes: `ApiKeyAuth` (header `x-api-key`) and `BearerAuth` (HTTP bearer, JWT).
- **Error schemas.** [`shared/schemas/error-response.schema.ts`](../src/shared/schemas/error-response.schema.ts) defines the three error bodies the runtime produces: `appErrorResponseSchema` (`{ message, code }`), `validationErrorResponseSchema` (`{ message, errors, issues }`) and `internalErrorResponseSchema` (`{ message: 'Internal server error' }`).
- **Shared responses.** [`docs/openapi/responses.ts`](../src/docs/openapi/responses.ts) registers those schemas as components and registers seven response components: `ValidationError` (400), `ValidationOrBusinessRuleError` (400, fund transactions), `Unauthorized` (401), `Forbidden` (403), `NotFound` (404), `Conflict` (409) and `InternalError` (500). It exports:
  - `responseRef(name)`, a `$ref` to one of those components;
  - `globalErrorResponses`, the 401/403/500 responses produced by the global middlewares.
- **Response schemas.** Each module's `<x>.schema.ts` describes the Prisma model as serialized to JSON, using the primitives in [`shared/schemas/output.schema.ts`](../src/shared/schemas/output.schema.ts):
  - `decimalString` for `Decimal` columns (Prisma serializes them as strings);
  - `dateTimeString` for `DateTime` columns (ISO 8601 date-time).

  Entity and list-response schemas are named with `.openapi('<X>')` / `.openapi('List<X>Response')`, so they become components automatically.
- **Module files.** Each `<module>.openapi.ts`:
  - registers the create and update input schemas with `openApiRegistry.register(...)` and uses the **returned** schema, so request bodies reference the components. The update input adds `minProperties: 1` to document the "at least one field" rule;
  - defines one entity example and one input example;
  - calls `registerPath` for the five operations. Error responses use `responseRef(...)` plus `...globalErrorResponses`; 409 is documented only in modules with a unique constraint.
  - [`docs/openapi/modules.ts`](../src/docs/openapi/modules.ts) imports all of them for their side effects.
- **Tags.** [`docs/openapi/tags.ts`](../src/docs/openapi/tags.ts) defines one tag per module.
- **Document generation.**
  - [`docs/openapi/document.ts`](../src/docs/openapi/document.ts) builds an OpenAPI 3.0.0 document with `OpenApiGeneratorV3`.
  - The single server is `http://localhost:${PORT}/v1/api`.
  - Global security is a single requirement with both `ApiKeyAuth` and `BearerAuth` (both are required).
- **Swagger UI.**
  - [`docs/openapi/openapi.routes.ts`](../src/docs/openapi/openapi.routes.ts) serves `GET /docs/openapi.json` plus Swagger UI at `/docs`.
  - The document is generated on the **first request** to `/docs` and then reused.
  - Only [`local.ts`](../src/local.ts) imports this router, and mounts it only when docs are enabled (see [Section 4](#4-request-lifecycle)). `app.ts` and `handler.ts` do not import any documentation module, so the docs code is not part of the Lambda bundle (`npm run offline`, which uses `handler.ts`, does not serve `/docs` either). The `zod-to-openapi` library itself is still loaded, because the response schemas imported by the routes use `.openapi()`.
- **Tests.** The `src/docs/openapi/__tests__/` specs check the document against the runtime (see [Section 12](#12-testing-architecture)).

**Known limitations of the documentation:**
- Response schema nullability is written by hand and not checked by the tests, because the Prisma 7 DMMF exposed by `@prisma/client` does not include whether a field is optional.
- `.strict()` on query schemas (unknown query parameters → 400) cannot be expressed for OpenAPI 3.0 parameters.
- The generated `offset` query parameter is marked `nullable: true` although the schema does not accept `null`.
- `BearerAuth` declares `bearerFormat: 'JWT'`; the runtime does not check the token format.

---

## 12. Testing Architecture

Configuration:
- Vitest ([`vitest.config.ts`](../vitest.config.ts)) with `globals: true`, `environment: 'node'`, `clearMocks: true`.
- Setup files: `config/zod-openapi.ts` and `test/setup.ts` (`reflect-metadata`).
- Vitest aliases are defined for `@modules`, `@services`, `@shared`, `@config` and `@docs`.

There are 52 spec files: 48 co-located in each module's `__tests__/` folder, one for `prismaCall` and three for the OpenAPI documentation.

### Use case unit tests (39 files)

- Each test builds a hand-written repository mock and instantiates the use case directly with `new`, without the DI container:
  ```ts
  repo = { findByName: vi.fn(), create: vi.fn() } as unknown as ILedgerRepository;
  sut = new CreateLedgerUseCase(repo);
  ```
- They assert repository call arguments, returned values and thrown errors. Errors are asserted either by class or by message, depending on the file.
- Seven modules test all five use cases. `ledger` and `financial-currency` test only create and update.

### Route validation tests (9 files)

- Each `<module>.routes.spec.ts` mounts the module router on a fresh `express()` app.
- It replaces `controllerAdapter` with `vi.mock('@shared/http/controller.adapter', ...)`, which returns a stub that records the request and responds 200.
- These tests cover Zod validation (400 responses, strict schemas, coercion, transforms) and route wiring.
- They do not execute controllers.

### `prismaCall` test (1 file)

- [`prisma-call.spec.ts`](../src/shared/database/prisma/__tests__/prisma-call.spec.ts) checks the P2002 → `ConflictError` and P2025 → `NotFoundError` translations and that other errors are rethrown unchanged.

### OpenAPI tests (3 files)

Located in [`src/docs/openapi/__tests__/`](../src/docs/openapi/__tests__). Required environment variables are set by the side-effect module `test-env.ts`.

| Spec | What it checks |
|---|---|
| `openapi-document.spec.ts` | Every Express route mounted by `routes.ts` is documented, and vice versa. Each method uses the conventional success status. Security requires both schemes. Every operation documents 400/401/403/500 (and 404 when it has `{id}`) through shared response components. Every `$ref` resolves, no component is unused, `operationId`s are unique, path params and tags are declared. Each response schema has exactly the fields of its Prisma model, with the JSON type of each Prisma type. |
| `openapi-errors.spec.ts` | The bodies produced by the real `validateRequest`, `apiKeyMiddleware` and `errorHandler` (validation error, each `AppError` subclass, unexpected error) match the documented error schemas. |
| `openapi-contract.spec.ts` | Every documented operation runs through the real routes, validation, controllers and use cases, with each repository token registered as a mock that returns a Prisma-like record (`Prisma.Decimal`, `Date`) built from the documented example. The response must use the documented success status and match the documented example and response schema. |

The contract spec keeps an explicit table of modules (model, repository token, path, response schemas).

### Layers without tests

- `controllerAdapter` error paths, and controllers beyond the success paths exercised by the contract spec.
- Global middleware: authentication and request container (API key and error handler are exercised by `openapi-errors.spec.ts`).
- `AuthService` and the external authentication API.
- DI container registrations (`shared/container/index.ts`).
- Repository implementations, Prisma, the database and migrations.
- `app.ts` composition and end-to-end requests through the full middleware chain.

No coverage tool is configured in `package.json`. CI runs `npm run test` in the `validate` job.

---

## 13. Architectural Invariants

These rules hold in **every** module without exception in the current code.

1. **Module file set.** Every module contains the same set of source files (routes, controller, openapi, `dtos/`, `schemas/`, `usecases/`, `repositories/` with interface, implementation and token) and a `__tests__/<module>.routes.spec.ts`.
2. **Route shape.** Every module router defines the same five endpoints, each composed as `validateRequest(...)` → `controllerAdapter(Controller, method)`.
3. **Controllers depend only on use cases.** Controllers import only `express`, `tsyringe` and their module's use cases, and inject exactly the five use case classes.
4. **One repository per use case.** All 45 use cases have exactly one `@inject`, a repository token, and a single public method `execute`.
5. **Only repositories access the database.** The `prisma` client is imported only by the nine repository implementations. No `$transaction` or raw SQL is used.
6. **Writes go through `prismaCall`; reads do not.** Each repository wraps exactly `create`, `update` and `delete`.
7. **Module DTO files are `z.infer` of module schemas.**
8. **No module imports another module.**
9. **Responses are Prisma records without mapping.** Single records, `{ items, total }` for lists, and an empty 204 for deletes.
10. **Path `:id` is validated as a CUID** with the shared `idParamsSchema`.
11. **Central registration.** Every module is registered in [`shared/container/index.ts`](../src/shared/container/index.ts), [`routes.ts`](../src/routes.ts), [`docs/openapi/modules.ts`](../src/docs/openapi/modules.ts) and [`docs/openapi/tags.ts`](../src/docs/openapi/tags.ts).
12. **Every DB unique constraint has a use case pre-check** that throws `ConflictError`.
13. **Pagination defaults.** `limit` defaults to 20 and is capped at 100 in every repository; list query schemas cap `limit` at 100 and use `.strict()`.
14. **Create schemas use `.strict()`; update schemas require at least one field.**
15. **Among use cases, `NotFoundError` is thrown only by get-by-id use cases**, and every get-by-id use case throws it when the record is missing. Outside use cases, `prismaCall` throws it for P2025.
16. **Repository tokens** are string constants of the form `'<Name>Repository' as const`, and every repository is registered with `registerSingleton`.
17. **Style rules are enforced by ESLint** ([`eslint.config.mjs`](../eslint.config.mjs)), e.g., aligned `key-spacing`, single quotes and 2-space indentation. CI runs lint.
18. **Test strategy.** All use case specs instantiate the use case with `new` and a hand-written mock. All route specs mock `controllerAdapter`.

---

## 14. Strong Conventions

These are followed by most applicable modules but have at least one exception.

| Convention | Followed by | Exception |
|---|---|---|
| Unique business keys are normalized with `trim().toUpperCase()` before checking and persisting | 7/7 modules with a unique key normalize the checked value; update persists the normalized value in 7/7 | `CreateFinancialCategoryUseCase` persists the original `input.name` |
| Update uniqueness check ignores the record being updated (`id !== id`) | 7/7 modules with a unique key | Two forms: `existing.id !== id` (5 modules) and `items[0].id !== id` (fund, category) |
| Unique lookup by dedicated finder (`findByName` / `findByDescription`) | 5 modules with single-column uniqueness | Composite keys (fund, category) use `findMany(..., { limit: 1 })` |
| Update schemas use `.strict()` | 8/9 | `updateLedgerSchema` |
| Controllers import use cases via `./usecases` | 8/9 | `ledger.controller.ts` imports `./usecases/index` |
| All five use cases have unit tests | 7/9 modules | `ledger`, `financial-currency` |
| Spec files import `reflect-metadata` explicitly (redundant with setup) | 27/39 use case specs | 12 specs |

Patterns that appear in **only one or two modules**, and are therefore not conventions:
- A business rule beyond uniqueness: only the fund-transaction create/update use cases (credit XOR debit).
- Date transforms: entries and fund transactions, with different implementations.

---

## 15. Known Architectural Inconsistencies

Listed factually. No fixes are proposed in this document.

**Data and validation**
1. `CreateFinancialCategoryUseCase` checks uniqueness with the normalized name but persists the non-normalized name. `UpdateFinancialCategoryUseCase` persists the normalized name. The create unit test asserts the non-normalized persistence.
2. In the fund and category update use cases, the uniqueness filter uses `input.ledgerId` / `input.parentCategoryId`. When these are not in the request body they are `undefined`, Prisma ignores them, and the check spans all ledgers or parents. The same applies to category create when `parentCategoryId` is omitted.
3. The category unique index `(ledger_id, parent_category_id, name)` does not use `NULLS NOT DISTINCT`. Under PostgreSQL defaults it does not prevent duplicate root categories (`parent_category_id IS NULL`).
4. The fund-transaction update use case validates the credit/debit rule only when both amounts are present in the request.
5. Use cases do not verify that referenced records (fund, category, bank account, description) belong to the `ledgerId` being written.
6. `additionalDescription` is required in the create schemas for entries and fund transactions, but nullable in the database.
7. `updateLedgerSchema` lacks `.strict()`, so unknown keys are stripped instead of rejected.

**Errors**

8. Foreign-key violations and malformed JSON bodies produce 500: `prismaCall` translates only P2002 and P2025, and `errorHandler` ignores the 400 status set by the JSON body parser. The OpenAPI `InternalError` response describes this behavior.

**Dependency injection and wiring**

9. The per-request child container has no scoped registrations, so it provides no per-request isolation.
10. `AuthService`, the Prisma client and configuration are outside the DI container. `prisma.client.ts` reads `process.env.DATABASE_URL` directly rather than `env`.
11. The composition root lives in `src/shared/` and imports every module.

**Runtime behavior**

12. `GET /health` is registered after `errorHandler` and behind the API key and authentication middleware.
13. `AUTH_API_URL` is required by `config/env.ts` but is not listed in `serverless.yml` `provider.environment` or in the deploy jobs' environment.

**Code-level oddities**

14. All nine get-by-id use cases declare `Promise<X | null>` but never return `null`.
15. `exists()` is declared and implemented in all repositories but is never called by application code (the OpenAPI contract spec only mocks it). `IdParamsDto` is declared but unused. `req.requestId` is set but never read.
16. List use cases always pass empty filters, so the `findMany` filter support is not reachable through the HTTP API.
17. `FinancialFundTransactionController.list` contains a `console.log`, which ESLint reports as a warning.
18. `package.json` lists the npm package `crypto` as a dependency, while the code imports `crypto` (resolved to the Node built-in). `typescript-eslint` is listed under `dependencies`.
19. The repository `README.md` contains only the project title.

---

## 16. Architectural Classification

### What the architecture is

**Modular monolith.**
- One deployable unit (a single Lambda, one Express app, one database schema).
- Code is split into nine feature modules that never import each other.
- Modules are coupled only through the shared database schema and central registration files.

**Layered architecture by feature.**
- Inside every module the same layers appear in the same order: route → validation → controller → use case → repository → Prisma.
- Each layer depends only on the next one (invariants 2–6).
- Layering is per module (vertical slices with internal layers), not global horizontal folders.

**Repository pattern.**
- All data access goes through a repository interface and its Prisma implementation, selected by a DI token.
- No other code touches Prisma (invariant 5).

**Use case / application service pattern.**
- Every operation is a dedicated class with a single `execute()` method, injected into the controller.
- Most use cases are thin: list, get-by-id and delete delegate directly, and entry create/update are pass-through.
- Logic is limited to name normalization, uniqueness checks and one credit/debit rule.

### Why it is not pure Clean Architecture

- There is no entity or domain layer; Prisma-generated types serve as entities.
- Use cases and repository interfaces depend on `@prisma/client` types (36 of 45 use cases import them) and on DTOs inferred from HTTP validation schemas. The inner layers therefore depend on framework and delivery details.
- The composition root resides in `shared/` and depends on all modules.

### Why it is not pure Hexagonal (Ports and Adapters)

- Only the outbound side has ports (repository interfaces).
- There are no inbound ports: controllers depend on concrete use case classes.
- The ports are shaped by the ORM (Prisma types as parameters and return values).
- Other infrastructure (authentication HTTP call, Prisma client, configuration) is used directly, not through ports.

### Why it is not DDD

- There are no aggregates, value objects, domain services, domain events or repositories per aggregate.
- Models are anemic Prisma records.
- Cross-entity rules are not enforced in code: for example, ledger consistency between related records, and balances that are plain writable fields.
- The domain vocabulary appears in names only.

---

## 17. Adding a New Module — Architectural Checklist

The structural steps the existing pattern currently requires. Use an existing module (e.g., [`financial-fund`](../src/modules/financial/financial-fund)) as the reference.

**Persistence**
- [ ] Add the model (and enums, if any) to [`schema.prisma`](../src/services/database/prisma/schema.prisma) and create a migration in [`migrations/`](../src/services/database/prisma/migrations). Run `prisma generate`.

**Module files** (under `src/modules/...`)
- [ ] `schemas/`: `create-<m>.schema.ts` (`.strict()`), `update-<m>.schema.ts` (optional fields, `.strict()`, at-least-one-field `refine`), `list-<m>-query.schema.ts` (`limit`/`offset`/`orderBy` enum/`orderDirection`, `.strict()`), `<m>.schema.ts` (every Prisma model field with its JSON type — `decimalString`, `dateTimeString`, `.nullable()` for optional columns — and `.openapi('<M>')`), `list-<m>-response.schema.ts` (`paginatedResponseSchema(...).openapi('List<M>Response')`), `index.ts`.
- [ ] `dtos/`: `create-<m>.dto.ts` and `update-<m>.dto.ts` as `z.infer<...>`, plus `index.ts`.
- [ ] `repositories/<m>.tokens.ts`: `export const <M>_REPOSITORY = '<Name>Repository' as const;`.
- [ ] `repositories/i<m>.repository.ts`: `create`, `findById`, `findMany`, `update`, `delete`, `exists`, plus a finder for any unique column.
- [ ] `repositories/<m>.repository.ts`: `@injectable()` implementation using `prisma`, with `prismaCall` around `create`/`update`/`delete` and the standard pagination in `findMany`.
- [ ] `usecases/`: `create`, `update`, `list`, `get-by-id`, `delete` use cases (`@injectable()`, `@inject(<M>_REPOSITORY)`, `execute()`), plus `index.ts`. Add a uniqueness pre-check for each DB unique constraint.
- [ ] `<m>.controller.ts`: `@injectable()`, inject the five use cases, same five methods and status codes as existing controllers.
- [ ] `<m>.routes.ts`: five routes with `validateRequest` (use `idParamsSchema` for `:id`) and `controllerAdapter`.
- [ ] `<m>.openapi.ts`: register the create/update input schemas (using the returned schemas), one entity example and one input example, and the five paths with `responseRef(...)` and `...globalErrorResponses` from `docs/openapi/responses.ts`. Document 409 only if the model has a unique constraint.

**Central registration**
- [ ] Register the repository in [`src/shared/container/index.ts`](../src/shared/container/index.ts) with `container.registerSingleton<I...>(TOKEN, Impl)`.
- [ ] Mount the router in [`src/routes.ts`](../src/routes.ts) under `/v1/api/...`. If the path is a prefix of, or is prefixed by, another module's path, check mount order (see `/financial/funds/transactions` before `/financial/funds`).
- [ ] Import `<m>.openapi.ts` in [`src/docs/openapi/modules.ts`](../src/docs/openapi/modules.ts).
- [ ] Add a tag in [`src/docs/openapi/tags.ts`](../src/docs/openapi/tags.ts).

**Tests**
- [ ] `__tests__/<m>.routes.spec.ts`: mount the router on a fresh Express app with `controllerAdapter` mocked, and cover validation.
- [ ] `__tests__/usecases/*.usecase.spec.ts`: instantiate each use case with `new` and a hand-written repository mock.
- [ ] Add the module to the `modules` table in [`openapi-contract.spec.ts`](../src/docs/openapi/__tests__/openapi-contract.spec.ts). The other OpenAPI specs pick up new routes and Prisma models automatically.

**Verification** (as run in CI)
- [ ] `npm run lint`, `npm run check:ts`, `npm run test`.
