# Manager API Development Guide

This guide explains how to work in this repository using the patterns the code already follows. It complements [ARCHITECTURE.md](ARCHITECTURE.md), which describes *what* the architecture is. This document covers *how* to work within it.

Conventions here are labeled by how strictly the current code follows them:

- **Invariant**: followed by every module without exception.
- **Strong convention**: followed by most modules, with documented exceptions.
- **Known exception**: current behavior that differs from the pattern. It is documented so you can recognize it, **not** as something to copy.

---

## 1. Getting Started

### Local requirements

| Requirement | Evidence |
|---|---|
| **Node.js 24** | CI uses `node-version: 24` ([deploy.yml](../.github/workflows/deploy.yml)); Lambda runtime is `nodejs24.x` ([serverless.yml](../serverless.yml)). `package.json` has no `engines` field and there is no `.nvmrc`. |
| **npm** | `package-lock.json` is committed and CI installs with `npm ci`. |
| **PostgreSQL** | Prisma datasource provider is `postgresql`. The repository does **not** provide a local database (no Docker/Compose files). You must supply a PostgreSQL instance yourself. |
| **A reachable authentication API** | Every API request (including `/health`) is validated against `${AUTH_API_URL}/auth/validate`. There is no local bypass in the code. |

### Install dependencies

```bash
npm install
```

CI uses `npm ci` for clean, lockfile-exact installs.

### Environment variables

Create a `.env` file based on [`.env.example`](../.env.example). `.env` is git-ignored; `.env.example` is committed.

| Variable | Read by | Required? | Notes |
|---|---|---|---|
| `NODE_ENV` | [`config/env.ts`](../src/config/env.ts), [`prisma.client.ts`](../src/services/database/prisma/prisma.client.ts) | optional (default `development`) | `development` enables Prisma query logging. `production` disables `/docs`. |
| `PORT` | `config/env.ts` | optional (default `3000`) | Used by `npm run dev`. `.env.example` sets `4000`. |
| `DATABASE_URL` | `config/env.ts`, `prisma.client.ts`, [`prisma.config.ts`](../prisma.config.ts) | **required** | App startup fails without it. |
| `SHADOW_DATABASE_URL` | `prisma.config.ts` | used by Prisma CLI | Needed by `prisma migrate dev`. Not read by the app. |
| `API_KEY` | `config/env.ts` | **required** | Clients must send it as `x-api-key`. |
| `AUTH_API_URL` | `config/env.ts` | **required** | Base URL of the external token-validation API. |
| `DOCS_ENABLED` | `config/env.ts` | optional (default `'false'`) | Set to `true` to serve Swagger UI at `/docs` (only when `NODE_ENV !== 'production'`). |

`config/env.ts` imports `dotenv/config`, so `.env` in the working directory is loaded automatically. `prisma.config.ts` also imports `dotenv/config`.

### Prisma and the database

1. Point `DATABASE_URL` (and `SHADOW_DATABASE_URL` for migrations) at your PostgreSQL databases.
2. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```
   This is required before type checking and tests too. Several Zod schemas import enums from `@prisma/client` (CI runs `prisma generate` before lint, type check and tests).
3. Apply migrations to your local database:
   ```bash
   npm run prisma:migrate:dev
   ```

### Run locally

There are two ways to run the API locally.

**Express server (recommended for day-to-day work)**

```bash
npm run dev
```

- Runs `tsc --noEmit --watch` and `tsx watch src/local.ts` in parallel.
- You get live type errors and auto-restart.
- Listens on `PORT` (default `3000`).
- This is the only way to get the Swagger UI (`DOCS_ENABLED=true`, see [Section 11](#11-openapi--swagger)).

**Serverless Offline (Lambda emulation)**

```bash
npm run offline
```

- Runs `serverless offline --noTimeout --reloadHandler` using [`src/handler.ts`](../src/handler.ts).
- Port is `3000` (`custom.serverless-offline.httpPort` in `serverless.yml`).
- Does not serve `/docs`: the handler path does not include the documentation.

VS Code users can use the **"Debug (tsx watch local.ts)"** launch configuration in [`.vscode/launch.json`](../.vscode/launch.json) to run `src/local.ts` with the inspector attached.

All endpoints are under `/v1/api/...`. Requests need:
- `x-api-key: <API_KEY>`
- `Authorization: Bearer <token>`, where the token must be accepted by `AUTH_API_URL`.

### Entry points

| File | Purpose |
|---|---|
| [`src/local.ts`](../src/local.ts) | Local HTTP server (`npm run dev`): mounts `/docs` when enabled, then `app` |
| [`src/handler.ts`](../src/handler.ts) | Lambda handler (`npm run offline`, deploys) |
| [`src/app.ts`](../src/app.ts) | Express app composition (shared by both; no documentation) |
| [`src/routes.ts`](../src/routes.ts) | Mounts all module routers |

### Serverless / AWS configuration relevant to development

- [`serverless.yml`](../serverless.yml) uses `useDotenv: true` and maps `NODE_ENV`, `DATABASE_URL`, `API_KEY` from your environment into `provider.environment`. `AUTH_API_URL` and `DOCS_ENABLED` are **not** listed there (see [Section 17](#17-adding-a-new-environment-variable)).
- Code is bundled with `serverless-esbuild` (no separate build step).

---

## 2. Common Commands

All commands below exist in [`package.json`](../package.json).

| Task | Command | When to use |
|---|---|---|
| Install dependencies | `npm install` (CI: `npm ci`) | After cloning or when `package.json` changes. |
| Run locally (Express) | `npm run dev` | Daily development: watch mode with type checking. |
| Run locally (Lambda emulation) | `npm run offline` | To exercise the Lambda handler path. |
| Lint | `npm run lint` | Before committing; CI runs it. |
| Lint and auto-fix | `npm run lint:fix` | To apply fixable lint rules (formatting, alignment). |
| Type check | `npm run check:ts` | Before committing; CI runs it. |
| Tests (default) | `npm run test` | Runs `vitest`: watch mode in an interactive terminal, single run in CI. |
| Tests (single run) | `npm run test:run` | Full suite once, e.g. before pushing. |
| Tests (watch) | `npm run test:watch` | While writing tests. |
| Run specific tests | `npm run test:run -- <path-or-pattern>` | Vitest accepts file filters, e.g. `npm run test:run -- src/modules/ledger`. Use `-t "<test name>"` to filter by name. |
| Generate Prisma client | `npm run prisma:generate` | After installing, and after every `schema.prisma` change. |
| Create/apply dev migration | `npm run prisma:migrate:dev` | After changing `schema.prisma`. Pass a name with `-- --name <name>` (example in [`.github/pull_request_template.md`](../.github/pull_request_template.md)). |
| Apply migrations (deploy mode) | `npm run prisma:migrate:prod` | Runs `prisma migrate deploy` against `DATABASE_URL`. **CI does not run this.** |
| Prisma Studio | `npm run prisma:studio` | Inspect data in the database. |
| Deploy | `npm run deploy:dev` / `npm run deploy:prod` | Manual Serverless deploy. Requires AWS credentials and env vars. Normally done by CI. |
| Tail Lambda logs | `npm run logs:dev` / `npm run logs:prod` | Follow logs of the `api` function. |
| Remove a stage | `npm run remove:dev` / `npm run remove:prod` | Deletes the deployed stack. Destructive. |

Some flows have **no dedicated command**:
- **Build / package:** there is no `build` script. Bundling happens inside `serverless deploy` through `serverless-esbuild`.
- **Coverage:** no coverage tool is installed.
- **Database setup / seed:** no script; no seed files exist.

---

## 3. Repository Structure

Where you normally work:

| Path | What you change there |
|---|---|
| [`src/modules/`](../src/modules) | Almost all feature work. One folder per resource: `ledger/` and `financial/<feature>/`. |
| [`src/shared/`](../src/shared) | Cross-cutting code, rarely changed: DI registrations (`container/index.ts`), HTTP adapter and middlewares, `AppError` classes, `prismaCall`, shared DTOs/schemas. **You edit `container/index.ts` when adding a module.** |
| [`src/services/`](../src/services) | Infrastructure: `auth/auth.service.ts` (external token validation) and `database/prisma/` (client, `schema.prisma`, `migrations/`). |
| [`src/docs/openapi/`](../src/docs/openapi) | OpenAPI registry, document generation, Swagger router. **You edit `modules.ts` and `tags.ts` when adding a module.** |
| [`src/config/`](../src/config) | `env.ts` (env var access) and `zod-openapi.ts` (Zod extension). |
| [`src/routes.ts`](../src/routes.ts) | Central route mounting. **You edit it when adding a module.** |
| `src/modules/**/__tests__/` | Tests, co-located with each module. [`src/test/setup.ts`](../src/test/setup.ts) is the global setup. |
| [`src/services/database/prisma/`](../src/services/database/prisma) | Prisma schema and migrations. |

---

## 4. How to Add a New Module

Every existing module has the same file set. Copy the structure, not the business logic. Pick a reference module by the kind of uniqueness your resource has:

| Your resource has… | Reference module |
|---|---|
| A single globally unique column (e.g. `name`) | [`financial-payment-method`](../src/modules/financial/financial-payment-method) (smallest), or [`financial-currency`](../src/modules/financial/financial-currency) |
| A composite unique key (e.g. per ledger) | [`financial-fund`](../src/modules/financial/financial-fund) |
| No business unique constraint | [`financial-entry`](../src/modules/financial/financial-entry) |

Below, `<m>` is the kebab-case module name (e.g. `financial-payment-method`). `<M>` is the PascalCase name (e.g. `FinancialPaymentMethod`). Prerequisite: the Prisma model exists and the client is generated (see [Section 16](#16-adding-a-new-database-field)).

### Step 1 — Module directory

Create `src/modules/financial/<m>/` (or `src/modules/<m>/` for a top-level resource like `ledger`). Inside it, create the folders `dtos/`, `schemas/`, `usecases/`, `repositories/` and `__tests__/usecases/`.

### Step 2 — Schemas (`schemas/`)

| File | Responsibility | Reference |
|---|---|---|
| `create-<m>.schema.ts` | Body validation for `POST`. Use `.strict()`. | [create-financial-payment-method.schema.ts](../src/modules/financial/financial-payment-method/schemas/create-financial-payment-method.schema.ts) |
| `update-<m>.schema.ts` | Body validation for `PATCH`. Fields optional, `.strict()`, `.refine(...)` requiring at least one field. | [update-financial-payment-method.schema.ts](../src/modules/financial/financial-payment-method/schemas/update-financial-payment-method.schema.ts) |
| `list-<m>-query.schema.ts` | Query validation for `GET /`: `limit`, `offset`, `orderBy` (module-specific enum), `orderDirection`, `.strict()`. | [list-financial-payment-method-query.schema.ts](../src/modules/financial/financial-payment-method/schemas/list-financial-payment-method-query.schema.ts) |
| `<m>.schema.ts` | Response schema for OpenAPI: every field of the Prisma model as serialized to JSON (`decimalString` for `Decimal`, `dateTimeString` for `DateTime`, `.nullable()` for optional columns), named with `.openapi('<M>')`. Not derived from the create schema. | [financial-fund.schema.ts](../src/modules/financial/financial-fund/schemas/financial-fund.schema.ts) |
| `list-<m>-response.schema.ts` | `paginatedResponseSchema(<m>Schema).openapi('List<M>Response')` for OpenAPI. | [list-financial-fund-response.schema.ts](../src/modules/financial/financial-fund/schemas/list-financial-fund-response.schema.ts) |
| `index.ts` | Barrel re-exporting the five schemas. | [schemas/index.ts](../src/modules/financial/financial-payment-method/schemas/index.ts) |

Details: [Section 6](#6-schemas-and-validation).

### Step 3 — DTOs (`dtos/`)

Depends on step 2.

- `create-<m>.dto.ts`: `export type Create<M>Dto = z.infer<typeof create<M>Schema>;`
- `update-<m>.dto.ts`: same for the update schema.
- `index.ts`: barrel.

Reference: [financial-payment-method/dtos/](../src/modules/financial/financial-payment-method/dtos). Details: [Section 7](#7-dtos).

### Step 4 — Repository interface (`repositories/i<m>.repository.ts`)

Depends on step 3 and the generated Prisma type.

- Declare `create`, `findById`, `findMany(filters?, params?)`, `update`, `delete`, `exists`.
- Add `findByName` (or the equivalent finder) if the model has a single unique column.

Reference: [ifinancial-payment-method.repository.ts](../src/modules/financial/financial-payment-method/repositories/ifinancial-payment-method.repository.ts).

### Step 5 — Repository token (`repositories/<m>.tokens.ts`)

```ts
export const FINANCIAL_PAYMENT_METHOD_REPOSITORY = 'FinancialPaymentMethodRepository' as const;
```

Every module uses a string constant `'<M>Repository' as const` (invariant).

### Step 6 — Repository implementation (`repositories/<m>.repository.ts`)

Depends on steps 3–4.

- `@injectable()` class implementing the interface with the shared `prisma` client.
- Wrap writes in `prismaCall`.
- Use the standard pagination in `findMany`.

Reference: [financial-payment-method.repository.ts](../src/modules/financial/financial-payment-method/repositories/financial-payment-method.repository.ts). Details: [Section 9](#9-repositories).

### Step 7 — Use cases (`usecases/`)

Depends on steps 3–5.

- Create five files: `create-<m>`, `update-<m>`, `list-<m>`, `get-by-id-<m>`, `delete-<m>` (`.usecase.ts`), plus an `index.ts` barrel.
- Each is an `@injectable()` class that injects the repository with `@inject(<TOKEN>)` and exposes `execute()`.

Reference: [financial-payment-method/usecases/](../src/modules/financial/financial-payment-method/usecases). Details: [Section 8](#8-use-cases).

### Step 8 — Controller (`<m>.controller.ts`)

Depends on step 7.

- `@injectable()` class injecting the five use case classes.
- Methods `create` (201), `list` (200), `getById` (200), `update` (200), `delete` (204).

All controllers are structurally identical; copy one and rename. Reference: [financial-payment-method.controller.ts](../src/modules/financial/financial-payment-method/financial-payment-method.controller.ts).

### Step 9 — Routes (`<m>.routes.ts`)

Depends on steps 2 and 8.

- Five routes, each `validateRequest({...})` followed by `controllerAdapter(<M>Controller, '<method>')`.
- Use the shared `idParamsSchema` for `/:id`.

Reference: [financial-payment-method.routes.ts](../src/modules/financial/financial-payment-method/financial-payment-method.routes.ts).

### Step 10 — OpenAPI (`<m>.openapi.ts`)

Depends on step 2.

- Register the create and update input schemas with `openApiRegistry.register(...)` and use the **returned** schemas in `registerPath`. Add `.openapi({ minProperties: 1 })` to the update schema.
- Define one entity example (as the API returns it: decimals as strings, dates as date-time) and one input example.
- Register five paths with `openApiRegistry.registerPath(...)`, using the module's tag name. Error responses use `responseRef(...)` and `...globalErrorResponses` from [`docs/openapi/responses.ts`](../src/docs/openapi/responses.ts). Add `409: responseRef('Conflict')` on create/update if the model has a unique constraint or foreign keys, and on delete if other models reference it.

Reference: [financial-payment-method.openapi.ts](../src/modules/financial/financial-payment-method/financial-payment-method.openapi.ts). Details: [Section 11](#11-openapi--swagger).

### Step 11 — Tests (`__tests__/`)

- `__tests__/<m>.routes.spec.ts`: validation and routing tests.
- `__tests__/usecases/<operation>-<m>.usecase.spec.ts`: one per use case.
- Add the module to the `modules` table in [`openapi-contract.spec.ts`](../src/docs/openapi/__tests__/openapi-contract.spec.ts). The other OpenAPI specs cover new routes and Prisma models automatically.

Reference: [financial-fund-transaction/\_\_tests\_\_/](../src/modules/financial/financial-fund-transaction/__tests__) (most recent style). Details: [Section 14](#14-testing).

### Step 12 — DI registration ([`src/shared/container/index.ts`](../src/shared/container/index.ts))

Depends on steps 4–6. Append a block:

```ts
import { FinancialPaymentMethodRepository } from '@modules/financial/financial-payment-method/repositories/financial-payment-method.repository';
import { IFinancialPaymentMethodRepository } from '@modules/financial/financial-payment-method/repositories/ifinancial-payment-method.repository';
import { FINANCIAL_PAYMENT_METHOD_REPOSITORY } from '@modules/financial/financial-payment-method/repositories/financial-payment-method.tokens';
container.registerSingleton<IFinancialPaymentMethodRepository>(FINANCIAL_PAYMENT_METHOD_REPOSITORY, FinancialPaymentMethodRepository);
```

If you skip this, use case resolution fails at request time. No test covers it.

### Step 13 — Central route registration ([`src/routes.ts`](../src/routes.ts))

Depends on step 9. Import the router and mount it:

```ts
import financialPaymentMethodRoute from '@modules/financial/financial-payment-method/financial-payment-method.routes';
router.use(`${basePath}/financial/payment-methods`, financialPaymentMethodRoute);
```

**Mount order matters** when one path is a prefix of another. `/financial/funds/transactions` is mounted before `/financial/funds`; otherwise the funds router's `/:id` would match `transactions`.

### Step 14 — OpenAPI module and tag registration

Depends on step 10.

- Add `import '@modules/.../<m>.openapi';` to [`src/docs/openapi/modules.ts`](../src/docs/openapi/modules.ts).
- Add `{ name, description }` to [`src/docs/openapi/tags.ts`](../src/docs/openapi/tags.ts). The `name` must match the `tags` used in `<m>.openapi.ts`.

---

## 5. How to Add or Change an Endpoint

### Current pipeline

```
<m>.routes.ts
  → validateRequest({ params?, query?, body? })      # Zod parse; replaces req.params/query/body
  → controllerAdapter(<M>Controller, 'method')       # resolves controller from req.container
  → <M>Controller.method(req, res)                   # maps request → use case; sets status
  → <Operation><M>UseCase.execute(...)               # application logic
  → I<M>Repository (token) → <M>Repository → prisma
```

### Scope of current precedent

Every module currently exposes **only** the five CRUD endpoints (`GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`). There is no existing custom (non-CRUD) endpoint. A new endpoint should follow the pipeline above, which is the only established pattern.

### Adding a route or HTTP method

- **Route:** add `router.<method>(path, validateRequest({...}), controllerAdapter(<M>Controller, '<methodName>'))` in `<m>.routes.ts`. `methodName` must be a method of the controller class; `controllerAdapter` throws if it is not a function.
- **Controller:** add the method; it receives `(req, res)` and returns `res.status(...).json(...)` or `.send()`. Inject any new use case class in the constructor with `@inject(<UseCaseClass>)`.
- **Use case:** a new `@injectable()` class with `execute()`, exported from `usecases/index.ts`. There is no registration step; tsyringe resolves it by class.

### Path parameters

- `:id` uses the shared [`idParamsSchema`](../src/shared/schemas/id.schema.ts), which validates a CUID.
- No other path parameter exists today. If you add one, pass its schema in `validateRequest({ params })`.

### Query parameters

- List query schemas are `.strict()`, so any new query parameter must be added to the schema, or requests using it get 400.
- The controller `list` methods build `ListParamsDto` explicitly from `limit`, `offset`, `orderBy`, `orderDirection`. A new parameter must also be passed by the controller.
- No list endpoint currently supports filtering (see [Section 9](#9-repositories)).

### Body validation

Add or update the Zod schema and pass it as `validateRequest({ body })`. After validation, `req.body` contains the **parsed** value: transforms and defaults are applied.

### Response

- Controllers return what the use case returns, i.e. Prisma records, `{ items, total }` for lists, or an empty body for 204.
- There are no response mappers or response validation.
- Status codes are set in the controller.

### OpenAPI

Update `<m>.openapi.ts` with `registerPath(...)`. Paths there are relative to `/v1/api` (e.g. `'/financial/funds/{id}'`). The path definition is not generated from routes, but `openapi-document.spec.ts` fails if a route is missing from the documentation or a documented path has no route. Use the shared responses from `docs/openapi/responses.ts` for errors (see [Section 11](#11-openapi--swagger)).

### Tests

Add cases to `<m>.routes.spec.ts` for the validation rules, and a use case spec for the new logic. Note that route specs mock `controllerAdapter`, so they do not run controllers. The OpenAPI specs in `src/docs/openapi/__tests__/` assume the five CRUD operations per module; a non-CRUD endpoint needs its own expectations there.

---

## 6. Schemas and Validation

### TRUE INVARIANTS (all 9 modules)

- `create<M>Schema` uses `.strict()`. Unknown body keys → 400.
- `update<M>Schema` makes every field optional and uses `.refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' })`.
- `list<M>QuerySchema`:
  - `limit: z.coerce.number().int().min(1).max(100).optional()`
  - `offset: z.coerce.number().int().min(0).optional()`
  - `orderBy: z.enum([...module fields]).optional()`
  - `orderDirection: z.enum(['asc', 'desc']).optional()`
  - `.strict()`
- `:id` is validated with the shared `idParamsSchema` (`z.cuid({ error: 'Invalid id' })`) on `GET`, `PATCH` and `DELETE /:id`.
- The response schema (`<m>.schema.ts`) lists every field of the Prisma model with its JSON type (`decimalString`, `dateTimeString`, `.nullable()` for optional columns) and is named with `.openapi('<M>')`; the list response is `paginatedResponseSchema(<m>Schema).openapi('List<M>Response')`. Both are used **only** for OpenAPI and its tests.
- `validateRequest` replaces `req.params`, `req.query` and `req.body` with the parsed result.

### STRONG CONVENTIONS

- `update<M>Schema` also uses `.strict()` (8/9 modules).
- Field constraints repeat the database column limits with explicit messages, e.g. `.max(100, 'Name must have at most 100 characters')` for `VarChar(100)` columns.
- **Enums** come from the Prisma client, e.g. `z.enum(LedgerType)` (ledger, bank-account, category, entry). This makes these schemas depend on `prisma generate`.
- **Coercion** is used only for query parameters (`z.coerce.number()`). Body numbers use `z.number()`.
- **Transforms** convert ISO dates (`z.iso.date(...)`) into `Date` objects.
- **Defaults:** optional numeric fields with a database default use `.optional().default(0)` in create schemas (e.g. `balance`, `amountCredit`, `amountPaid`).
- **Foreign keys** in bodies (`ledgerId`, `financialCurrencyId`, …) are validated as `z.string()` only (not CUID).

### KNOWN EXCEPTIONS (do not copy)

- [`updateLedgerSchema`](../src/modules/ledger/schemas/update-ledger.schema.ts) has no `.strict()`, so unknown keys are silently stripped.
- Date transforms differ:
  - entries: `new Date(`${value}T00:00:00.000Z`)` ([create-financial-entry.schema.ts](../src/modules/financial/financial-entry/schemas/create-financial-entry.schema.ts));
  - fund transactions: `new Date(value)` ([create-financial-fund-transaction.schema.ts](../src/modules/financial/financial-fund-transaction/schemas/create-financial-fund-transaction.schema.ts)).
- `additionalDescription` is required in the entry and fund-transaction create schemas while the column is nullable.

---

## 7. DTOs

- **Module DTOs (invariant):** every file in `dtos/` is a type alias of the schema output:
  ```ts
  export type CreateLedgerDto = z.infer<typeof createLedgerSchema>;
  ```
  They describe the value **after** Zod parsing (e.g. `Date` instead of string; defaults applied).
- **Create/update DTOs** are the input types of create/update use cases and of the repository `create`/`update` methods. Repositories pass them straight to Prisma as `data`.
- **Shared DTOs** in [`src/shared/dtos/`](../src/shared/dtos) are hand-written interfaces:
  - [`ListParamsDto`](../src/shared/dtos/list-params.dto.ts): `{ limit?, offset?, orderBy?: string, orderDirection? }`. It is not inferred from the list query schemas; the controller converts `req.query` into it with `Number(...)` and casts.
  - [`PaginatedResponseDto<T>`](../src/shared/dtos/paginated-response.dto.ts): `{ items: T[]; total: number }`.
- **What each use case receives:**

| Use case | Input |
|---|---|
| create | `Create<M>Dto` |
| update | `(id: string, Update<M>Dto)` |
| list | `ListParamsDto` |
| get-by-id, delete | `id: string` |

- **Coupling:** module DTOs are derived from the HTTP validation schemas. Changing a schema changes the DTO type, and therefore the use case and repository signatures.
- `IdParamsDto` exists in [`id.schema.ts`](../src/shared/schemas/id.schema.ts) but is not used anywhere.

---

## 8. Use Cases

### Pattern (invariant across all 45 use cases)

```ts
@injectable()
export class CreateFinancialCurrencyUseCase {
  constructor(
    @inject(FINANCIAL_CURRENCY_REPOSITORY)
    private readonly financialCurrencyRepository: IFinancialCurrencyRepository
  ) {}

  async execute(input: CreateFinancialCurrencyDto): Promise<FinancialCurrency> { ... }
}
```

- One class per operation, one file per class, exported from `usecases/index.ts`.
- `@injectable()`; **exactly one** constructor dependency: the module's repository interface, injected by token.
- A single public method: `execute`.
- Use cases do not call other use cases, other modules' repositories, or Prisma directly.

### Behavior by operation

| Operation | Current behavior | Errors |
|---|---|---|
| **create** | Pass-through to `repository.create`. Modules with a unique key normalize it and pre-check uniqueness first. | `ConflictError` on duplicate |
| **update** | `const data = { ...input }`. If the unique field is present: normalize, look it up, reject if found on a **different** id, set the normalized value on `data`. Then `repository.update(id, data)`. | `ConflictError` on duplicate |
| **list** | `repository.findMany({}, params)`. | — |
| **get-by-id** | `repository.findById(id)`; throws if `null`. | `NotFoundError` |
| **delete** | `repository.delete(id)`. No existence check. | — |

Neither update nor delete checks that the record exists first. See [Section 12](#12-error-handling) for what happens when it does not.

### Normalization and uniqueness (when the model has a unique key)

- **Strong convention:** normalize the unique value with `trim().toUpperCase()`, check it, and persist the normalized value.
- **Single-column keys:** `findByName(name)` / `findByDescription(description)`, then `existing.id !== id` on update. References: ledger, currency, description, payment-method, bank-account.
- **Composite keys:** `findMany({ ...keyFields }, { limit: 1 })` and check `total > 0` (update: `items[0].id !== id`). References: fund, category.

### Application errors

Import from [`@shared/errors/app-error`](../src/shared/errors/app-error.ts):
- `ConflictError` (409);
- `NotFoundError` (404);
- `BadRequestError` (400);
- `Unauthorized` (401) and `Forbidden` (403), used by middleware, not by use cases.

### Do not copy domain-specific rules

Some use cases contain rules that belong only to their module:
- The credit/debit rule in [`create-financial-fund-transaction.usecase.ts`](../src/modules/financial/financial-fund-transaction/usecases/create-financial-fund-transaction.usecase.ts) (the only `BadRequestError` usage).
- The composite uniqueness of fund and category.

Copy the *structure* of a reference use case, not its rules.

### Known exceptions (do not copy)

- [`CreateFinancialCategoryUseCase`](../src/modules/financial/financial-category/usecases/create-financial-category.usecase.ts) checks the normalized name but persists `input` unchanged. Its unit test asserts this. The category **update** use case does persist the normalized name.
- In the fund and category update use cases, the uniqueness filter uses `input.ledgerId` / `input.parentCategoryId`. When those fields are absent they are `undefined` and Prisma ignores them, so the check runs across all ledgers or parents. Category create behaves the same when `parentCategoryId` is omitted.
- The fund-transaction update use case validates the credit/debit rule only when both amounts are present.
- All get-by-id use cases declare `Promise<X | null>` but never return `null`.

---

## 9. Repositories

### Files

| File | Content |
|---|---|
| `i<m>.repository.ts` | Interface; uses Prisma model types and module DTOs. |
| `<m>.tokens.ts` | String DI token. |
| `<m>.repository.ts` | `@injectable()` implementation. |

The implementation imports the shared client:

```ts
import { prisma } from '@services/database/prisma/prisma.client';
```

**Only repository implementations import `prisma`** (invariant). Prisma is not injected.

### Reads vs writes (invariant)

| Method | Prisma call | Wrapped in `prismaCall`? |
|---|---|---|
| `create(data)` | `prisma.<model>.create({ data })` | **yes** |
| `update(id, data)` | `prisma.<model>.update({ where: { id }, data })` | **yes** |
| `delete(id)` | `prisma.<model>.delete({ where: { id } })` | **yes** |
| `findById(id)` | `findUnique({ where: { id } })` | no |
| `findByName` / `findByDescription` | `findUnique` on the unique column | no |
| `findMany(filters, params)` | `findMany` + `count` | no |
| `exists(id)` | `count({ where: { id } }) > 0` | no |

[`prismaCall`](../src/shared/database/prisma/prisma-call.ts) converts Prisma `P2002` (unique violation) and `P2003` (foreign-key violation) into `ConflictError`, `P2025` (record to update or delete not found) into `NotFoundError`, and rethrows everything else unchanged. This is where update and delete get their 404, and where foreign-key and ledger-mismatch errors get their 409. No repository uses `$transaction` or raw SQL.

### Pagination, `findMany`, count (invariant)

```ts
const limit = Math.min(params.limit ?? 20, 100);
const offset = params.offset ?? 0;
const { <fields> } = filters;
const orderBy = params.orderBy ? { [params.orderBy]: params.orderDirection ?? 'asc' } : undefined;

const [items, total] = await Promise.all([
  prisma.<model>.findMany({ where: { <fields> }, skip: offset, take: limit, orderBy }),
  prisma.<model>.count({ where: { <fields> } }),
]);
return { items, total };
```

### Filters

- `findMany` destructures an explicit list of model fields from `filters: Partial<Entity>`.
- Keys with `undefined` values are ignored by Prisma.
- The list use cases always pass `{}`, so HTTP list endpoints do not filter.
- Non-empty filters are used only internally by the fund and category uniqueness checks.

### Unique checks

- Every database unique constraint has a pre-check in the create and update use cases (see [Section 8](#8-use-cases)).
- The pre-check is not atomic with the write. A concurrent duplicate is caught by the database constraint and becomes a `ConflictError` through `prismaCall`.

### Return values

Repositories return Prisma model records (or `null` from finders, `void` from `delete`). These are returned unchanged up to the HTTP response.

### `exists()`

`exists(id)` is declared in every interface and implemented in every repository, but **no application code calls it** (the OpenAPI contract spec only provides it in its repository mocks). It is part of the existing contract. Implementing it keeps the module consistent, but no use case is required to call it.

---

## 10. Dependency Injection

### Registering a repository

There is a single composition root: [`src/shared/container/index.ts`](../src/shared/container/index.ts). It is loaded once by `import '@shared/container'` in `app.ts`. For each module:

```ts
container.registerSingleton<I<M>Repository>(<M>_REPOSITORY, <M>Repository);
```

The flow is **repository token → repository implementation**, registered as a **singleton** on the root container.

### How controllers and use cases are resolved

- Controllers and use cases are **not registered**.
- They are `@injectable()` classes, and tsyringe resolves them by class token, creating a **new instance per resolution** (transient).
- Controllers inject use cases by class: `@inject(CreateLedgerUseCase)`.
- Use cases inject repositories by token: `@inject(LEDGER_REPOSITORY)`.

### Child container per request

1. [`requestContainerMiddleware`](../src/shared/http/middlewares/request-container.middleware.ts) sets `req.container = container.createChildContainer()`.
2. [`controllerAdapter`](../src/shared/http/controller.adapter.ts) resolves the controller from `req.container`.

### Current scope limitations

- No registration uses `Lifecycle.ContainerScoped`, `registerScoped` or `ResolutionScoped`.
- Repositories come from the root singletons, and controllers and use cases are transient either way.
- So the child container does **not** currently provide request-scoped instances. Do not rely on per-request state isolation through DI.

Not managed by DI: `AuthService` (created with `new` in `authMiddleware`), the Prisma client (imported directly) and `env` (imported directly).

---

## 11. OpenAPI / Swagger

### Flow

```
shared/schemas/error-response.schema.ts  error bodies produced by the runtime
  → docs/openapi/responses.ts             registers error schemas + shared responses; exports responseRef, globalErrorResponses
<m>/schemas/<m>.schema.ts                 response schema (Prisma model as JSON), .openapi('<M>')
<m>.openapi.ts                            registers input schemas + five paths (side effect on import)
  → docs/openapi/registry.ts              shared OpenAPIRegistry + ApiKeyAuth / BearerAuth schemes
  → docs/openapi/modules.ts               imports every <m>.openapi.ts
  → docs/openapi/document.ts              OpenApiGeneratorV3 → OpenAPI 3.0.0 (tags from tags.ts, server http://localhost:${PORT}/v1/api)
  → docs/openapi/openapi.routes.ts        GET /docs/openapi.json + Swagger UI at /docs (document built on first request)
```

- The router is imported and mounted only by [`src/local.ts`](../src/local.ts), and only when `NODE_ENV !== 'production'` and `DOCS_ENABLED === 'true'`. `app.ts` does not reference it, so the documentation code is not in the Lambda bundle. The document is generated on the first request to `/docs` and then reused.
- To view the docs locally, set `DOCS_ENABLED=true` and open `http://localhost:<PORT>/docs`. `/docs` does not require the API key or a token.
- Security is a single requirement: **both** `x-api-key` and the bearer token.

### Conventions in `<m>.openapi.ts`

- Register the create and update input schemas with `openApiRegistry.register(name, schema)` and use the **returned** schema in `registerPath`. Registering without using the returned schema produces an unused component and an inline schema (the document spec fails on unused components).
- Response schemas are named in their own files with `.openapi('<M>')`; do not register them again.
- Error responses: `400: responseRef('ValidationError')` (fund transactions use `'ValidationOrBusinessRuleError'` on create/update), `404: responseRef('NotFound')` on operations with `{id}`, `409: responseRef('Conflict')` on create/update of models with a unique constraint or foreign keys and on delete of models referenced by others (`openapi-document.spec.ts` enforces the foreign-key cases), and `...globalErrorResponses` (401/403/500) on every operation.
- One entity example and one input example per module, reused by all operations. Entity examples use the JSON form the API returns: decimals as strings, dates as ISO date-time.

### What to update

| Change | Update |
|---|---|
| New module | `<m>.openapi.ts`, response schemas, import in [`modules.ts`](../src/docs/openapi/modules.ts), tag in [`tags.ts`](../src/docs/openapi/tags.ts), `modules` table in `openapi-contract.spec.ts` |
| New/changed endpoint | `registerPath(...)` in `<m>.openapi.ts` (method, path relative to `/v1/api`, request schemas, responses, examples) |
| Changed input schema | Automatic for registered Zod schemas; update the input example if needed |
| New/changed DB field | `<m>.schema.ts` (response) and the entity example — not automatic |
| New error behavior | `error-response.schema.ts` and/or `responses.ts` |

### Tests that guard the documentation

`src/docs/openapi/__tests__/` (see [Section 14](#14-testing)) fails when:
- a route is not documented, or a documented path has no route;
- a success status, security requirement or error response deviates from the conventions above;
- a `$ref` is broken, a component is unused, or an `operationId` is duplicated;
- a response schema's fields or JSON types differ from the Prisma model;
- the error bodies produced by the middlewares stop matching the documented schemas;
- running a documented operation through the real routes, controllers and use cases does not return the documented status, example and schema.

Not covered: nullability in response schemas (the Prisma 7 DMMF does not expose it), and error paths other than those in `openapi-errors.spec.ts`. See [ARCHITECTURE.md §11](ARCHITECTURE.md#11-openapi-documentation) for the known limitations.

---

## 12. Error Handling

Current runtime behavior:

| Situation | Who handles it | Status | Response body |
|---|---|---|---|
| Invalid params/query/body | `validateRequest` (responds directly, does **not** reach `errorHandler`) | 400 | `{ message: 'Invalid params' \| 'Invalid query' \| 'Invalid body', errors, issues: [{ path, message, code }] }` |
| `AppError` subclasses | [`errorHandler`](../src/shared/http/middlewares/error-handlers.middleware.ts) (logs with `console.warn`) | `err.statusCode` | `{ message, code }` |
| `ConflictError` (use case duplicate check, or Prisma `P2002`/`P2003` via `prismaCall`) | `errorHandler` | 409 | `{ message, code: 'CONFLICT' }` |
| `NotFoundError` (get-by-id use cases, or Prisma `P2025` via `prismaCall` on update/delete of a missing record) | `errorHandler` | 404 | `{ message: 'Resource not found', code: 'NOT_FOUND' }` |
| `BadRequestError` (fund-transaction rule) | `errorHandler` | 400 | `{ message, code: 'BAD_REQUEST' }` |
| Missing `x-api-key` / missing or invalid `Authorization` / token rejected by auth API | `errorHandler` | 401 | `{ message, code: 'UNAUTHORIZED' }` |
| Wrong `x-api-key` | `errorHandler` | 403 | `{ message: 'Invalid API key', code: 'FORBIDDEN' }` |
| Prisma errors other than `P2002`/`P2003`/`P2025` | `errorHandler` (logs with `console.error`) | **500** | `{ message: 'Internal server error' }` |
| Malformed JSON body (`express.json()` parse error) | `errorHandler` (ignores the parser's 400 status) | **500** | `{ message: 'Internal server error' }` |
| Network failure calling the auth API | `errorHandler` | 500 | `{ message: 'Internal server error' }` |
| Any other unexpected error | `errorHandler` | 500 | `{ message: 'Internal server error' }` |
| Unknown route | No custom 404 handler (after API key and auth checks) | Express default 404 | Express default |

Practical consequences today:
- `PATCH` or `DELETE` on a valid but non-existent CUID returns **404** (from `prismaCall`), even though the use cases do not check existence.
- A body with a non-existent foreign-key id returns **409** `{ message: 'Operation conflicts with related records', code: 'CONFLICT' }` (Prisma `P2003`).
- A body that references a fund, category or bank account of **another ledger** is rejected by the database and returns **409**. The same happens when a PATCH changes `ledgerId` so that the references no longer match, or moves a referenced fund, category or bank account to another ledger ([ARCHITECTURE.md §7](ARCHITECTURE.md#7-data-and-persistence)).
- Deleting a record still referenced by others (FK `RESTRICT`), including a category that has subcategories, returns **409**.
- A malformed JSON body returns **500**, not 400.

Throw `AppError` subclasses from use cases; controllers do not catch errors. `controllerAdapter` forwards them with `next(err)`.

---

## 13. Authentication and Request Pipeline

Middleware order in [`src/app.ts`](../src/app.ts):

| # | Middleware | Effect |
|---|---|---|
| 1 | `express.json()` | Parses JSON bodies. |
| 2 | `requestContainerMiddleware` | Sets `req.requestId` (not read anywhere else) and `req.container`. |
| 3 | `apiKeyMiddleware` | Requires `x-api-key` equal to `API_KEY` (timing-safe compare). |
| 4 | `authMiddleware` | Requires `Authorization: Bearer <token>`; `AuthService` calls `GET ${AUTH_API_URL}/auth/validate`. Non-2xx → 401. |
| 5 | `routes` | `/v1/api/...` module routers. |
| 6 | `errorHandler` | Converts errors to responses (see [Section 12](#12-error-handling)). |
| 7 | `GET /health` | Returns `{ ok: true, service: 'manager-api' }`. Registered after `errorHandler`. |

The local server ([`src/local.ts`](../src/local.ts)) wraps `app` in an outer Express server that mounts `/docs` → `openApiRoutes` **before** `app` (only if `NODE_ENV !== 'production'` and `DOCS_ENABLED === 'true'`). The Lambda handler uses `app` directly and has no `/docs`.

### Which endpoints are protected

| Endpoint | API key | Bearer token |
|---|---|---|
| `/docs`, `/docs/openapi.json` (local server only, when enabled) | no | no |
| `/v1/api/**` | yes | yes |
| `GET /health` | yes | yes |
| Unknown paths | yes | yes (before the default 404) |

**Identity and authorization:**
- The auth API response body is not read.
- No user identity is attached to the request, and there are no per-user or per-ledger access checks.
- Any request that passes both checks can access all data.

---

## 14. Testing

Tests use Vitest with Supertest, `globals: true`, `clearMocks: true`. Setup files are [`src/config/zod-openapi.ts`](../src/config/zod-openapi.ts) and [`src/test/setup.ts`](../src/test/setup.ts). Spec files live in `__tests__/` folders: 39 use case specs and 9 route specs inside the modules, one `prismaCall` spec in `src/shared/database/prisma/__tests__/` and three OpenAPI specs in `src/docs/openapi/__tests__/`.

### Use case tests

Location: `__tests__/usecases/<operation>-<m>.usecase.spec.ts`.

Observed in all 39 files:
- **Direct instantiation, no DI container:** `sut = new CreateLedgerUseCase(repo);`. The variable is always named `sut`.
- **Manual mock of the repository interface** with `vi.fn()` for only the methods the use case calls, cast to the interface:
  ```ts
  repo = {
    findByName : vi.fn(),
    create     : vi.fn(),
  } as unknown as ILedgerRepository;
  ```
- The mock and the SUT are built in `beforeEach`.
- Return values are set with `(repo.create as any).mockResolvedValue(...)`.
- Assertions check repository calls (`toHaveBeenCalledWith`, `toHaveBeenCalledTimes`, `not.toHaveBeenCalled`) and results (`toBe`).
- Errors are asserted either by message (`rejects.toMatchObject({ message })`) or by class; both styles exist.
- Arrange/Act/Assert is followed in structure but **not** marked with comments.
- 27 of 39 files also `import 'reflect-metadata'`, which is redundant with the setup file.

Reference: [create-financial-fund-transaction.usecase.spec.ts](../src/modules/financial/financial-fund-transaction/__tests__/usecases/create-financial-fund-transaction.usecase.spec.ts).

### Route tests

Location: `__tests__/<m>.routes.spec.ts`.

- **Isolated router:** a fresh `express()` app with `express.json()` mounts only the module router. The mount path in the test does not have to match `src/routes.ts`; some tests use different paths (e.g. `/financial-currencies`).
- **`controllerAdapter` is mocked** with `vi.mock('@shared/http/controller.adapter', ...)`. The stub records the call in a `controllerSpy` and responds without running the controller.
  - Most recent modules (7/9) create the spy with `vi.hoisted`.
  - 5/9 return a method-specific status (201 for `create`, 204 for `delete`, otherwise 200): bank-account, category, entry, fund, fund-transaction.
  - The other 4/9 (ledger, currency, description, payment-method) return 200 for every method.
  - Ledger and currency are the two specs that do not use `vi.hoisted`.
- **Focus:** Zod validation (400 + `message` + `issues`), `.strict()` rejection, coercion and transforms of `req.query`/`req.body`, CUID validation of `:id`, and that the controller stub is (or is not) called.
- A hard-coded valid CUID is used for `:id` cases.

Reference: [financial-fund-transaction.routes.spec.ts](../src/modules/financial/financial-fund-transaction/__tests__/financial-fund-transaction.routes.spec.ts).

### `prismaCall` test

[`prisma-call.spec.ts`](../src/shared/database/prisma/__tests__/prisma-call.spec.ts) builds `Prisma.PrismaClientKnownRequestError` instances and checks the P2002 → `ConflictError`, P2003 → `ConflictError` and P2025 → `NotFoundError` translations, and that other errors are rethrown unchanged.

### OpenAPI tests

Location: [`src/docs/openapi/__tests__/`](../src/docs/openapi/__tests__). These specs import `./test-env` first, which sets the variables required by `config/env.ts`.

| Spec | Checks |
|---|---|
| `openapi-document.spec.ts` | Documented operations equal the Express routes mounted by `routes.ts` (read from the router stack); success status per method; security; shared error responses; 409 wherever a foreign key can be violated (derived from `Prisma.dmmf`); `$ref` integrity, unused components, unique `operationId`s, path params, tags; response schema fields and JSON types against `Prisma.dmmf`. |
| `openapi-errors.spec.ts` | Bodies from the real `validateRequest`, `apiKeyMiddleware` and `errorHandler` parse with the documented error schemas. |
| `openapi-contract.spec.ts` | Each documented operation runs through the real routes, validation, controllers and use cases. Repository tokens are registered in the tsyringe container with mocks that return a Prisma-like record (`Prisma.Decimal`, `Date`) built from the documented entity example. The response must have the documented success status, equal the documented example and parse with the response schema. The spec has an explicit `modules` table that must include every module. |

### Notes

- Tests import Zod schemas that use `@prisma/client` enums, so `prisma generate` must have run.
- [`vitest.config.ts`](../vitest.config.ts) defines aliases for `@modules`, `@services`, `@shared`, `@config` and `@docs`.

### Layers without tests

- `controllerAdapter` error paths, and controllers beyond the success paths run by the OpenAPI contract spec.
- Repositories, Prisma, database and migrations.
- Global middlewares: request container and auth (API key and error handler are run by `openapi-errors.spec.ts`).
- `AuthService` and the external auth API.
- DI container registration.
- App end-to-end (`app.ts`, `handler.ts`).

---

## 15. Development Workflow

A workflow using only the tools in this repository:

1. **Understand the related module.**
   - Read its `routes`, `controller`, `usecases`, `repositories` and `schemas`.
   - Check whether the behavior you are touching is listed as an exception in this guide or in [ARCHITECTURE.md §15](ARCHITECTURE.md#15-known-architectural-inconsistencies).
2. **Make the change** following the existing module structure. Use `npm run dev` for live type errors and a running server.
3. **Lint:** `npm run lint` (or `npm run lint:fix` for auto-fixable issues).
4. **Type check:** `npm run check:ts`.
5. **Run related tests:** `npm run test:run -- src/modules/<path-to-module>`.
6. **Run the full suite:** `npm run test:run`.
7. **Review the diff:** `git diff`. Check for leftover debug output and for unintended changes to central files.
8. **Contract changes** (endpoint, schema, status code):
   - update `<m>.openapi.ts` and, for field changes, `<m>.schema.ts`;
   - run the OpenAPI specs: `npm run test:run -- src/docs`;
   - optionally run with `DOCS_ENABLED=true` and check `/docs` or `/docs/openapi.json`.
9. **Schema changes:** if `schema.prisma` changed, include the generated migration (see [Section 16](#16-adding-a-new-database-field)).

Pushing to `develop` triggers a deploy to the `dev` stage; pushing to `main` deploys to `prod`. Both run only after the `validate` job (lint, type check, tests) succeeds.

---

## 16. Adding a New Database Field

1. **`schema.prisma`:** add the field to the model in [`src/services/database/prisma/schema.prisma`](../src/services/database/prisma/schema.prisma).
   - Existing models map camelCase fields to snake_case columns with `@map("...")` and tables with `@@map("...")`.
   - Text columns use `@db.VarChar(n)`; money uses `Decimal @db.Decimal(18, 2)`.
   - A new reference from a ledger-scoped model to a fund, category or bank account (or any other ledger-scoped model) uses a composite relation: `@relation(fields: [<x>Id, ledgerId], references: [id, ledgerId], onDelete: Restrict, onUpdate: Restrict)`. The referenced model must declare `@@unique([id, ledgerId])`. References to global catalogs (currency, description) stay single-column.
2. **Migration:**
   ```bash
   npm run prisma:migrate:dev -- --name <migration_name>
   ```
   - This requires `DATABASE_URL` and `SHADOW_DATABASE_URL`.
   - Existing migration names describe the change in snake_case: `create_table_financial_funds`, `add_collum_financial_bank_account_id_to_table_financial_fund_transactions`, `update_unique_key_table_financial_funds`.
   - Commit the generated folder under `migrations/`.
3. **Prisma generate:**
   ```bash
   npm run prisma:generate
   ```
4. **Zod schemas:**
   - Add the field to `create-<m>.schema.ts` and `update-<m>.schema.ts` (optional in update), mirroring the column constraints.
   - If it should be sortable, add it to the `orderBy` enum in `list-<m>-query.schema.ts`.
   - Add the field to the response schema `<m>.schema.ts` with its JSON type (`decimalString` for `Decimal`, `dateTimeString` for `DateTime`, `.nullable()` if optional). It is **not** derived from the create schema; `openapi-document.spec.ts` fails until it matches the Prisma model.
5. **DTOs:** no change needed; they are `z.infer` of the schemas.
6. **Repository:**
   - `create`/`update` pass `data` through, so the new field flows automatically.
   - Add it to the `filters` destructuring in `findMany` only if a use case needs to filter by it.
   - If the field is unique, add a finder (single column) and use it from the use cases.
7. **Use cases:** change only if the field takes part in normalization, uniqueness or another rule.
8. **OpenAPI:** update the entity example and input example in `<m>.openapi.ts`. `openapi-contract.spec.ts` fails if the entity example does not match what the API returns.
9. **Tests:** add route validation cases for the new field and adjust use case specs if logic changed.

How migrations reach deployed environments is not defined in the repository. CI runs `prisma generate` only, and `npm run prisma:migrate:prod` must be run separately.

---

## 17. Adding a New Environment Variable

1. **[`src/config/env.ts`](../src/config/env.ts):** add it to the `env` object using the existing helpers.
   - `required(name)`: throws `Missing required env var: <name>` **at import time** if unset or empty.
   - `optional(name, fallback?)`: returns the value or the fallback; may be `undefined`.
   - `numberVar(name, fallback?)`: parses a number; throws if missing without fallback or not numeric.

   Read it through `env` (e.g. `env.apiKey`). Exception: `prisma.client.ts` reads `process.env.DATABASE_URL` directly.
2. **Local development:** add it to your `.env`, and add it to [`.env.example`](../.env.example) so others know it exists.
3. **Serverless:** to make it available in Lambda, add it to `provider.environment` in [`serverless.yml`](../serverless.yml), e.g. `MY_VAR: ${env:MY_VAR}`. `.env*` files are excluded from the deployment package, so `dotenv` will not supply values in Lambda.
4. **CI/CD:** the deploy jobs in [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) set `NODE_ENV`, `DATABASE_URL` (secret) and `API_KEY` (secret) for `serverless deploy`. A new variable must be added to both `deploy-dev` and `deploy-prod`, typically from GitHub secrets or vars.

**Example of the risk:**
- `AUTH_API_URL` is `required()` in `env.ts` and listed in `.env.example`.
- It is **not** in `serverless.yml` `provider.environment` nor in the CI deploy `env`.
- Locally it works because `.env` is loaded. Without it the app throws at startup, and the repository does not show how deployed environments receive it.

When adding a required variable, check all four places.

---

## 18. Definition of Done

- [ ] Behavior implemented in the correct layer (route → validation → controller → use case → repository).
- [ ] Zod schemas updated, and DTOs still correct (`z.infer`).
- [ ] New module or route registered where needed: `shared/container/index.ts`, `routes.ts` (check mount order), `docs/openapi/modules.ts`, `docs/openapi/tags.ts`.
- [ ] `<m>.openapi.ts` (and `<m>.schema.ts` for field changes) updated for contract changes; the OpenAPI specs in `src/docs/openapi/__tests__/` pass.
- [ ] Prisma: `schema.prisma` changes come with a committed migration; `npm run prisma:generate` was run.
- [ ] New env vars added to `env.ts`, `.env.example`, `serverless.yml` and the CI deploy jobs.
- [ ] Route spec and use case specs added or updated.
- [ ] `npm run lint` passes.
- [ ] `npm run check:ts` passes.
- [ ] `npm run test:run` passes.
- [ ] Diff reviewed; no debug output left (`console.log` triggers an ESLint warning).
- [ ] No known exception (Sections [6](#6-schemas-and-validation), [8](#8-use-cases), [19](#19-common-pitfalls)) copied into new code.

---

## 19. Common Pitfalls

1. **Forgetting a central registration.**
   - A module needs entries in four files: `shared/container/index.ts`, `routes.ts`, `docs/openapi/modules.ts`, `docs/openapi/tags.ts`.
   - `openapi-document.spec.ts` fails if `routes.ts`, `modules.ts` and `tags.ts` are out of sync with each other. No test checks `shared/container/index.ts`: the contract spec registers its own repository mocks.
2. **Route mount order.** A router mounted under a prefix of another path captures it through `/:id` (see `/financial/funds/transactions` vs `/financial/funds` in `routes.ts`).
3. **Assuming OpenAPI is derived from the code.** Paths, examples and response schemas are hand-written. The OpenAPI specs catch most drift, but not response nullability, and they assume the five CRUD operations per module.
4. **Assuming the request container gives request-scoped dependencies.** It does not; nothing is registered with a scoped lifecycle.
5. **Thinking `exists()` must be used.** It is in every repository contract but unused.
6. **Copying an exception from a reference module:**
   - category create persisting a non-normalized name;
   - `updateLedgerSchema` without `.strict()`;
   - the fund/category uniqueness filters with possibly `undefined` fields;
   - the fund-transaction credit/debit rule;
   - the `console.log` in `FinancialFundTransactionController.list`;
   - get-by-id return types with `| null`.
7. **`:id` vs foreign keys.** Path `:id` is CUID-validated; body foreign keys are only `z.string()`. A foreign key that does not exist, or that belongs to another ledger, is only rejected by the database and returns 409 (`P2003`), not 400.
8. **Expecting use cases to detect missing records on update/delete.** They do not check existence; the 404 comes from `prismaCall` translating Prisma `P2025`. A use case that needs the record before writing must fetch it itself.
9. **Prisma `undefined` filters.** Passing `undefined` in a `findMany` filter removes that condition instead of matching null.
10. **Skipping `prisma generate`.** Schemas import Prisma enums; type check and tests fail without a generated client.
11. **Using `npm run test` in a script expecting it to exit.** Locally it starts watch mode; use `npm run test:run`.
12. **No local auth bypass.** Every request, including `/health`, needs a valid API key **and** a token accepted by `AUTH_API_URL`.
13. **Pushing to `develop` or `main` deploys.** The workflow deploys on push to those branches after validation.
14. **New env vars missing in deployment.** See the `AUTH_API_URL` example in [Section 17](#17-adding-a-new-environment-variable).
15. **Ignoring the value returned by `openApiRegistry.register()`.** Passing the original schema to `registerPath` inlines it and leaves an unused component; `openapi-document.spec.ts` fails on unused components.

---

## 20. Quick Reference

**Request flow**

```
local only: (/docs) → app
app:        express.json → requestContainer → apiKey → auth → routes → errorHandler → (/health)
route → validateRequest → controllerAdapter → Controller → UseCase.execute → I<M>Repository → <M>Repository → prisma → PostgreSQL
```

**Dependency flow**

```
Controller ──@inject(UseCaseClass)──► UseCase ──@inject(<M>_REPOSITORY)──► I<M>Repository
                                                                              ▲ registerSingleton (shared/container/index.ts)
                                                                        <M>Repository ──► prisma (import)
Modules never import other modules.
```

**Register a new module in:**
1. `src/shared/container/index.ts` (token → repository, `registerSingleton`)
2. `src/routes.ts` (mount under `/v1/api/...`, check order)
3. `src/docs/openapi/modules.ts` (import `<m>.openapi`)
4. `src/docs/openapi/tags.ts` (tag)
5. `src/docs/openapi/__tests__/openapi-contract.spec.ts` (`modules` table)

**Most used commands**

```bash
npm run dev
```

```bash
npm run lint
```

```bash
npm run check:ts
```

```bash
npm run test:run
```

```bash
npm run prisma:generate
```

```bash
npm run prisma:migrate:dev -- --name <migration_name>
```

**Module structure**

```
<m>/
├── <m>.routes.ts  <m>.controller.ts  <m>.openapi.ts
├── dtos/          create-<m>.dto.ts, update-<m>.dto.ts, index.ts
├── schemas/       create-, update-, list-<m>-query, <m>, list-<m>-response, index
├── usecases/      create-, update-, list-, get-by-id-, delete-<m>.usecase.ts, index.ts
├── repositories/  i<m>.repository.ts, <m>.repository.ts, <m>.tokens.ts
└── __tests__/     <m>.routes.spec.ts, usecases/*.usecase.spec.ts
```

**Before finishing**

- [ ] lint ✓
- [ ] type check ✓
- [ ] tests ✓
- [ ] registrations ✓
- [ ] OpenAPI specs ✓
- [ ] migration committed ✓
- [ ] env vars wired ✓
- [ ] no debug code ✓
- [ ] no exception copied ✓
