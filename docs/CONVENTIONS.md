# Manager API Conventions

## 1. Purpose

This document answers one question: **when I write new code in this repository, which rules must I follow?** It is a rule book. Most rules are derived from the committed code and checked against it module by module; others record decisions made for the project, such as the design and readability principles in [Section 2](#2-general-principles).

| Document | Answers |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the system is built today, including known inconsistencies. |
| [DEVELOPMENT.md](DEVELOPMENT.md) | How to work in the repository: setup, commands, step-by-step guides. |
| **CONVENTIONS.md** | Which rules new code follows. |

New code follows these conventions. Deviating from a **MUST** or **SHOULD** requires an explicit justification in the pull request. Existing code that breaks a rule is listed in [Section 19](#19-code-that-should-not-be-copied); it is not a precedent.

| Level | Meaning |
|---|---|
| **MUST** | Required: a project invariant, enforced by tooling or tests, needed for correct behavior, or a consolidated architectural decision. |
| **SHOULD** | Strongly established convention; exceptions are possible but must be justified. |
| **AVOID** | Existing pattern identified as an inconsistency, legacy, accidental behavior or known problem, or a pattern that must not be introduced without an explicit decision. Do not replicate or introduce it. |

---

## 2. General Principles

1. **Modules are isolated.** A module never imports another module; relations exist only in the database schema.
2. **HTTP stays at the edge.** Routes and controllers deal with Express; use cases receive plain data and never see `req`/`res`.
3. **Only repositories touch the database.** Use cases depend on repository interfaces, never on Prisma.
4. **Validate at the edge.** Every request input is validated with Zod by `validateRequest` before reaching a controller.
5. **Explicit dependencies.** Classes receive dependencies through constructor injection (tsyringe).
6. **Copy structure, not behavior.** Domain rules of one module are not templates for another.
7. **Runtime and documentation stay aligned.** The OpenAPI tests fail when they drift.
8. **Human readability comes first.** Code is written for developers to understand and maintain, not to minimize line count or maximize abstraction.
9. **Prefer established designs.** Use simple, conventional and proven solutions before introducing novel abstractions or additional architectural patterns.

### Design and Readability

**MUST**
- Write code for human readers. New code must be straightforward for another developer to read, understand and maintain without reverse-engineering clever abstractions. Prefer:
  - descriptive names that express intent;
  - explicit and predictable control flow;
  - small, cohesive units with clear responsibilities;
  - obvious data transformations;
  - visible dependencies;
  - conventional TypeScript, Express, Prisma and OOP idioms;
  - code whose normal execution path can be followed without unnecessary context.
- Do not trade clarity for cleverness. Avoid:
  - cleverness for its own sake;
  - dense expressions that save lines but reduce clarity;
  - hidden side effects;
  - unnecessary indirection;
  - deeply nested logic when it can be expressed more clearly;
  - abstractions that require navigating several files to understand a simple operation;
  - comments that explain what unnecessarily complicated code is doing instead of simplifying the code.

Code is read far more often than it is written. Optimize for the next human who has to understand it.

**SHOULD**
- Prefer established object-oriented principles and well-known design patterns when they solve the problem clearly. Favor:
  - composition over unnecessary inheritance;
  - single, clear responsibilities;
  - explicit dependencies;
  - dependency inversion when it provides a concrete benefit;
  - encapsulation when it makes behavior easier to understand;
  - standard design patterns when they naturally match the problem;
  - simple solutions that can evolve when requirements become clearer.

  OOP and SOLID principles are tools and heuristics for producing understandable and maintainable code. They are not goals to maximize mechanically.
- Prefer explicit code over clever code. When two implementations are equally correct, prefer the one whose behavior is easier to infer by reading it. Fewer lines are not inherently better code. Prefer an explicit implementation over a compact or highly generic alternative when the explicit version is easier to understand and maintain.

**AVOID**
- Architectural sophistication without a concrete need. Do not introduce architectural patterns merely because they are considered "clean", "modern" or theoretically preferable. Avoid introducing, without a demonstrated problem and an explicit architectural decision:
  - DDD layers or tactical patterns;
  - CQRS;
  - Event Sourcing;
  - Hexagonal Architecture;
  - additional Clean Architecture layers;
  - generic command/query buses;
  - custom dependency-injection mechanisms;
  - generic repository frameworks;
  - speculative plugin systems;
  - custom internal frameworks;
  - abstractions created only for hypothetical future requirements.

  If the current architecture and a straightforward OOP solution solve the problem clearly, prefer them.

> Prefer boring, proven and readable code over clever, novel abstractions.
>
> Architecture exists to make the system easier to understand and change, not to maximize the number of architectural patterns used.

---

## 3. Naming Conventions

`<Module>` = PascalCase (`FinancialBankAccount`), `<module>` = camelCase (`financialBankAccount`), `<m>` = kebab-case (`financial-bank-account`), `<MODULE>` = UPPER_SNAKE (`FINANCIAL_BANK_ACCOUNT`).

| Level | Element | Convention | Example |
|---|---|---|---|
| MUST | Source files | kebab-case `<m>.<role>.ts`, role ∈ `routes`, `controller`, `openapi`, `schema`, `dto`, `usecase`, `repository`, `tokens` | `financial-fund.routes.ts` |
| MUST | Use case files | `<operation>-<m>.usecase.ts`, operation ∈ `create`, `update`, `list`, `get-by-id`, `delete` | `get-by-id-financial-fund.usecase.ts` |
| MUST | Repository interface | file `i<m>.repository.ts`, interface `I<Module>Repository` | `IFinancialFundRepository` |
| MUST | Repository token | `export const <MODULE>_REPOSITORY = '<Module>Repository' as const;` in `<m>.tokens.ts` | `FINANCIAL_FUND_REPOSITORY` |
| MUST | Classes | `<Module>Controller`, `<Module>Repository`, `<Operation><Module>UseCase` | `GetByIdFinancialFundUseCase` |
| MUST | Schemas | `create<Module>Schema`, `update<Module>Schema`, `list<Module>QuerySchema`, `<module>Schema` (response), `list<Module>ResponseSchema` | `listFinancialFundQuerySchema` |
| MUST | DTO types | `Create<Module>Dto`, `Update<Module>Dto` | `CreateFinancialFundDto` |
| MUST | Controller methods | `create`, `list`, `getById`, `update`, `delete` | `controllerAdapter(LedgerController, 'getById')` |
| MUST | Tables and columns | snake_case: tables plural via `@@map`, multi-word columns via `@map` | `@@map("financial_funds")`, `@map("ledger_id")` |
| SHOULD | Module directory | `financial-<name>` under `src/modules/financial/` for the financial domain; top-level `src/modules/<name>/` otherwise | `src/modules/financial/financial-fund/`, `src/modules/ledger/` |
| SHOULD | Router variables | `const router = Router()` + `export default router`; imported in `routes.ts` as `<module>Route` | `financialFundRoute` |
| SHOULD | Injected fields | `private readonly <operation><Module>UseCase`, `private readonly <module>Repository` | `private readonly financialFundRepository` |
| SHOULD | Prisma models and enums | PascalCase singular models, `Financial` prefix in the financial domain; PascalCase enums with UPPER_CASE values | `FinancialBankAccountType { PERSONAL BUSINESS }` |
| SHOULD | OpenAPI names | components `<Module>`, `List<Module>Response`, `Create<Module>Input`, `Update<Module>Input`; operationIds `list<Module>`, `create<Module>`, `get<Module>ById`, `update<Module>`, `delete<Module>`; tag = plural title | `getFinancialFundById`, tag `Financial Funds` |
| SHOULD | Test files and names | `__tests__/<m>.routes.spec.ts`, `__tests__/usecases/<operation>-<m>.usecase.spec.ts`; `describe('<ClassUnderTest>')`; `it('should …')`; SUT `sut`, repository mock `repo` | `describe('CreateLedgerUseCase')` |
| SHOULD | Migrations | Prisma timestamp + snake_case description of the change | `create_table_financial_funds`, `update_unique_key_table_financial_funds` |
| AVOID | Migration typos | `add_collum_...` is a historical typo; write `add_column_...` | — |

---

## 4. File and Module Structure

Canonical module (details: [DEVELOPMENT.md §4](DEVELOPMENT.md#4-how-to-add-a-new-module)):

```
src/modules/financial/<m>/
├── <m>.routes.ts  <m>.controller.ts  <m>.openapi.ts
├── dtos/          create-<m>.dto.ts  update-<m>.dto.ts  index.ts
├── schemas/       create-<m>.schema.ts  update-<m>.schema.ts  list-<m>-query.schema.ts
│                  <m>.schema.ts  list-<m>-response.schema.ts  index.ts
├── usecases/      create-  update-  list-  get-by-id-  delete-<m>.usecase.ts  index.ts
├── repositories/  i<m>.repository.ts  <m>.repository.ts  <m>.tokens.ts
└── __tests__/     <m>.routes.spec.ts  usecases/<operation>-<m>.usecase.spec.ts
```

**MUST**
- Put each resource in its own module folder with the files above.
- Provide `index.ts` barrels in `dtos/`, `schemas/` and `usecases/`; `repositories/` has no barrel.
- Never import another module: no `@modules/...` and no relative path leaving the module folder. A cross-module dependency requires an explicit architectural decision (none exists today).

**SHOULD**
- Place financial-domain modules under `src/modules/financial/`.

---

## 5. Routes

**MUST**
- One Express `Router()` per module, exported as default.
- Compose every endpoint as `validateRequest({ params?, query?, body? })` followed by `controllerAdapter(<Module>Controller, '<method>')`, in that order, with nothing in between.
- Validate `:id` with the shared `idParamsSchema` (`@shared/schemas/id.schema`).
- Mount the router in `src/routes.ts` under `/v1/api/...`.
- Mount a more specific path before a path that is its prefix. `/financial/funds/transactions` is mounted before `/financial/funds`; otherwise `/:id` would capture `transactions`.
- Document every route in OpenAPI ([Section 13](#13-openapi)); `openapi-document.spec.ts` fails otherwise.

**SHOULD**
- Use plural kebab-case paths; financial resources under `/financial/`; sub-resources nested (`/financial/funds/transactions`).
- For CRUD resources, expose `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`. Partial updates use `PATCH`; no `PUT` exists.
- Import `validateRequest` from `@shared/http/middlewares/validate.middleware` and `controllerAdapter` from `@shared/http/controller.adapter`, as every router does.

**AVOID**
- Business logic, response shaping or `try/catch` in route files.
- Extra per-route middleware without a decision; none exists today.

---

## 6. Controllers

**MUST**
- `@injectable()` class whose constructor injects only the module's use case classes, each with `@inject(<UseCaseClass>)`.
- Read input from `req.params`, `req.query` and `req.body`, which `validateRequest` has already replaced with parsed values.
- Set the status in the controller: `create` → `res.status(201).json(...)`; `list`, `getById`, `update` → `res.status(200).json(...)`; `delete` → `res.status(204).send()`. The OpenAPI tests check these codes.
- Return the use case result as is (Prisma record or `{ items, total }`); there are no response mappers.
- Let errors propagate: `controllerAdapter` forwards them to `errorHandler`.

**MUST NOT** (counted under AVOID)
- Contain business rules, normalization, uniqueness checks or database access.
- Inject repositories, Prisma or services.
- Catch errors or build error responses.
- Log with `console.log`.

---

## 7. Schemas and Validation

**MUST**
- Validate every input with a Zod schema passed to `validateRequest`.
- Create schemas end with `.strict()` (unknown keys → 400).
- Update schemas: every field `.optional()`, `.strict()`, and `.refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' })`.
- List-query schemas: `limit: z.coerce.number().int().min(1).max(100).optional()`, `offset: z.coerce.number().int().min(0).optional()`, `orderBy: z.enum([...sortable fields]).optional()`, `orderDirection: z.enum(['asc', 'desc']).optional()`, `.strict()`.
- Keep response schemas separate from input schemas ([Section 13](#13-openapi)).

**SHOULD**
- Use Prisma enums for enum fields: `z.enum(LedgerType)`.
- Mirror column limits with explicit messages: `.max(100, 'Name must have at most 100 characters')` for `VarChar(100)`.
- Coerce only query parameters; body fields use `z.number()` / `z.boolean()`.
- Give optional numeric fields that have a database default `.optional().default(0)` in create schemas.
- Validate date-only inputs with `z.iso.date({ error: '<Field> must be a valid ISO date' })` and transform to a `Date` at UTC midnight. Both existing transforms produce UTC midnight; there is no single preferred form yet.

**AVOID**
- Update schemas without `.strict()` (`updateLedgerSchema`).
- Deriving response schemas from input schemas with `.extend(...)`.

Foreign-key ids in bodies are currently `z.string()`. Their existence and, for ledger-scoped references, their ledger are enforced by the database, not checked before the write ([Section 12](#12-error-handling), [Section 17](#17-database-and-prisma)).

---

## 8. DTOs

**MUST**
- Create/update DTOs are type aliases of the schema output, in `dtos/<operation>-<m>.dto.ts` and re-exported from `dtos/index.ts`:
  `export type CreateLedgerDto = z.infer<typeof createLedgerSchema>;`
- Do not hand-write an interface that duplicates a schema.

**SHOULD**
- Use the shared DTOs for lists: `ListParamsDto` (input) and `PaginatedResponseDto<T>` (output) from `src/shared/dtos/`.
- Use case inputs: `create` → `Create<Module>Dto`; `update` → `(id: string, Update<Module>Dto)`; `list` → `ListParamsDto`; `getById`/`delete` → `id: string`.

DTOs are coupled to the HTTP schemas by design today ([ARCHITECTURE.md §5](ARCHITECTURE.md#5-dependency-direction)).

---

## 9. Use Cases

**MUST**
- One class per operation in `usecases/<operation>-<m>.usecase.ts`, exported from `usecases/index.ts`.
- `@injectable()`, a single public method `execute(...)`.
- Exactly one constructor dependency: the module repository, `@inject(<MODULE>_REPOSITORY) private readonly <module>Repository: I<Module>Repository`.
- `getById`: throw `NotFoundError` when the repository returns `null`.
- For each database unique constraint: pre-check in `create` and `update` and throw `ConflictError`; in `update`, ignore the record being updated (`existing.id !== id`).
- Throw `AppError` subclasses for expected failures ([Section 12](#12-error-handling)).

**MUST NOT** (counted under AVOID)
- Import the Prisma client or call `prisma`.
- Import Express types or receive `req`/`res`.
- Call controllers, other use cases, or another module's repository.
- Copy a domain rule from another module because the modules look similar.

**SHOULD**
- Normalize unique business values with `trim().toUpperCase()` before the check, and persist the normalized value.
- Single-column unique keys: use a dedicated finder (`findByName`). Composite keys: `findMany({ ...completeKey }, { limit: 1 })`.
- `update`: build `const data = { ...input }` and overwrite the normalized fields.
- `list`: `return this.<module>Repository.findMany({}, params);`.
- `update`/`delete`: rely on `prismaCall` for the 404 of a missing record (Prisma `P2025`); do not add an existence pre-check only to produce it.

---

## 10. Repositories

**MUST**
- Interface in `repositories/i<m>.repository.ts`; implementation `@injectable() export class <Module>Repository implements I<Module>Repository` in `repositories/<m>.repository.ts`; token in `repositories/<m>.tokens.ts`.
- Only repository implementations import `prisma` from `@services/database/prisma/prisma.client`.
- Wrap every write (`create`, `update`, `delete`) in `prismaCall`. It translates `P2002` and `P2003` → `ConflictError` and `P2025` → `NotFoundError`.
- Register the token in `src/shared/container/index.ts` ([Section 11](#11-dependency-injection)).

**SHOULD**
- Implement the standard contract: `create`, `findById`, `findMany(filters?, params?)`, `update`, `delete`, plus one finder per single-column unique key (`findByName`, `findByDescription`).
- Paginate `findMany` as all repositories do: `limit = Math.min(params.limit ?? 20, 100)`, `offset = params.offset ?? 0`, dynamic `orderBy`, `Promise.all([findMany, count])`, return `{ items, total }` ([DEVELOPMENT.md §9](DEVELOPMENT.md#9-repositories)).
- Destructure the filterable fields explicitly from `filters: Partial<Entity>`.
- Return Prisma model types; `null` from finders; `void` from `delete`.
- Leave reads unwrapped (`prismaCall` only matters for writes).

**AVOID**
- `exists(id)`. Every current repository declares and implements it, but no application code calls it. Treat it as a legacy part of the contract: do not add it to new repositories unless a use case needs it, and do not use it to produce 404s (`prismaCall` does).

---

## 11. Dependency Injection

**MUST**
- Use constructor injection with `@inject(...)` on every parameter: use case classes in controllers, repository tokens in use cases.
- Mark controllers, use cases and repositories `@injectable()`.
- Register repositories in `src/shared/container/index.ts`: `container.registerSingleton<I<Module>Repository>(<MODULE>_REPOSITORY, <Module>Repository);`.
- Do not register controllers or use cases; tsyringe resolves them by class (transient) through `controllerAdapter`.

**AVOID**
- Relying on request-scoped instances. The per-request child container has no scoped registrations ([ARCHITECTURE.md §6](ARCHITECTURE.md#6-dependency-injection)).
- Instantiating dependencies with `new` inside handlers or middlewares (`authMiddleware` does `new AuthService()`).
- Resolving from the container in application code (service locator); only `controllerAdapter` does it.

---

## 12. Error Handling

**MUST**
- Throw `AppError` subclasses from `@shared/errors/app-error` for expected failures:
  - `BadRequestError` (400) for business-rule violations;
  - `NotFoundError` (404) when a requested record does not exist;
  - `ConflictError` (409) for unique-value conflicts (and, via `prismaCall`, foreign-key violations);
  - `Unauthorized` (401) and `Forbidden` (403) are thrown by the authentication layer, not by use cases.
- Let errors propagate. Only `validateRequest` (Zod errors) and `errorHandler` (everything else) write error bodies.
- Leave request-shape validation to Zod; use cases validate business rules only.
- Leave referenced-id existence and ledger membership to the database. `prismaCall` translates the foreign-key violation (`P2003`) to `409 { message: 'Operation conflicts with related records', code: 'CONFLICT' }` for every operation; use cases do not load another module's records to check references.
- When adding an `AppError` subclass or a new `code`, update `appErrorResponseSchema` (`src/shared/schemas/error-response.schema.ts`), the responses in `src/docs/openapi/responses.ts` when a new status appears, and the list in `openapi-errors.spec.ts`.

**SHOULD**
- Give `ConflictError` a message naming the conflicting value, e.g. `'FinancialFund name already exists!'`.

**AVOID**
- `try/catch` in use cases or controllers to translate Prisma errors ad hoc.

**Known gap.** Malformed JSON bodies currently return 500 (the body parser's 400 is ignored by `errorHandler`). Do not work around it per module.

---

## 13. OpenAPI

Details and flow: [ARCHITECTURE.md §11](ARCHITECTURE.md#11-openapi-documentation), [DEVELOPMENT.md §11](DEVELOPMENT.md#11-openapi--swagger).

**MUST**
- Update `<m>.openapi.ts` whenever a route, request schema, response shape or status code changes. Import new module files in `src/docs/openapi/modules.ts` and add the tag to `src/docs/openapi/tags.ts`.
- Register input schemas and use the returned value:
  `const createLedgerInput = openApiRegistry.register('CreateLedgerInput', createLedgerSchema);`
  The update input adds `.openapi({ minProperties: 1 })`.
- Write response schemas explicitly in `<m>.schema.ts`, following the Prisma model as serialized to JSON: `decimalString` for `Decimal`, `dateTimeString` for `DateTime`, `.nullable()` for optional columns, named with `.openapi('<Module>')`. The list response is `paginatedResponseSchema(<module>Schema).openapi('List<Module>Response')`.
- Document errors only with `responseRef(...)` and `...globalErrorResponses` from `src/docs/openapi/responses.ts`.
- Document only the status codes the runtime produces: the success code per method, `400` on every operation, `404` on operations with `{id}`, `409` on create/update of models with a unique constraint or foreign keys and on delete of models referenced by others, plus the global `401`/`403`/`500`. `openapi-document.spec.ts` enforces the foreign-key cases.
- Keep security global in `document.ts` (API key **and** bearer); do not add per-operation alternatives.
- Write entity examples in the JSON form the API returns: decimals as strings, dates as ISO date-time.
- Add new modules to the `modules` table in `src/docs/openapi/__tests__/openapi-contract.spec.ts`.
- Run `npm run test:run -- src/docs` after any contract change.

**SHOULD**
- Define one entity example and one input example per module and reuse them in all operations.
- Use summaries `List`, `Create`, `Get by id`, `Update`, `Delete by id`.

**AVOID**
- Generic error schemas, inline error response blocks, response schemas built with `.extend()` from input schemas, and registering a schema without using the returned value. That was the previous OpenAPI model and it has been replaced.

---

## 14. Tests

**MUST**
- Use Vitest; spec files are `*.spec.ts` inside `__tests__/` next to the code under test.
- Test use cases in isolation: instantiate with `new`, pass a hand-written repository mock; no DI container, Prisma or database.
- In route specs, mock `controllerAdapter` (`vi.mock('@shared/http/controller.adapter', ...)`) and test validation and routing only.
- Import a test env module first in specs that load `src/config/env.ts`, which requires `DATABASE_URL`, `API_KEY` and `AUTH_API_URL` at load time. See `src/docs/openapi/__tests__/test-env.ts`.
- Keep `npm run test:run` green, including the OpenAPI specs.

**SHOULD**
- Name the use case spec after the class, `describe('CreateLedgerUseCase')`, and every case `it('should …')`.
- Build mocks and the SUT in `beforeEach`: `repo = { findByName: vi.fn(), create: vi.fn() } as unknown as ILedgerRepository; sut = new CreateLedgerUseCase(repo);`, and set results with `mockResolvedValue`.
- Write one spec per use case and cover all five use cases of a module.
- Write route specs like `financial-fund-transaction.routes.spec.ts`: `controllerSpy` created with `vi.hoisted`, a stub returning 201 for `create` and 204 for `delete`, the router mounted at its real path.
- When dropping a field from a fixture by destructuring, add `// eslint-disable-next-line @typescript-eslint/no-unused-vars`, as the existing specs do, so lint stays warning-free.

**AVOID**
- `import 'reflect-metadata'` in specs; `src/test/setup.ts` already loads it.
- Mounting the router under a path that differs from `routes.ts` (`/financial-currencies`, `/financial-descriptions`, `/financial-payment-methods`).
- Asserting known-wrong behavior as expected, like `create-financial-category.usecase.spec.ts` asserting a non-normalized name.

---

## 15. Imports

**MUST**
- No imports between modules ([Section 4](#4-file-and-module-structure)).
- Import the Zod OpenAPI extension first in entry points: `app.ts` starts with `import './config/zod-openapi';`, and `local.ts` imports `app` before any docs module.

**SHOULD**
- Inside a module, use relative imports (`./`, `../`). Outside the module, use the tsconfig aliases `@shared`, `@services`, `@docs`, `@config` (also defined in Vitest) and `@modules` (only outside `src/modules`). Every module follows this today.
- Import through barrels: `from './usecases'`, `from './schemas'`, `from '../dtos'`.
- Import Prisma model types and enums from `@prisma/client`.

**AVOID**
- `from './usecases/index'` (ledger controller) and `from './../repositories/...'` (create use cases): equivalent, but inconsistent.

Inside `src/shared/` and in the entry points both relative and alias imports exist; there is no rule there.

---

## 16. Formatting and Static Analysis

The tooling is the source of truth: [`eslint.config.mjs`](../eslint.config.mjs) and [`tsconfig.json`](../tsconfig.json). It requires:
- 2-space indentation and single quotes;
- object keys aligned on the colon (`key-spacing`);
- no `console` methods other than `warn`, `error` and `info`;
- no unused variables (arguments prefixed with `_` are ignored);
- TypeScript `strict` mode, with decorators and decorator metadata enabled.

**MUST**
- `npm run lint` with 0 errors and `npm run check:ts` passing; CI runs both before deploying.
- No new lint warnings. The two existing warnings are legacy ([Section 19](#19-code-that-should-not-be-copied)).

**SHOULD**
- Run `npm run lint:fix` to apply alignment and other fixable rules.
- Log with `console.warn`/`console.error`, as `errorHandler` and `prismaCall` do.

---

## 17. Database and Prisma

Workflow: [DEVELOPMENT.md §16](DEVELOPMENT.md#16-adding-a-new-database-field).

**MUST**
- Every schema change ships with a committed migration created by `npm run prisma:migrate:dev -- --name <name>`, followed by `npm run prisma:generate`.
- Every model has `id String @id @default(cuid())`, `createdAt DateTime @default(now()) @map("created_at")` and `updatedAt DateTime @updatedAt @map("updated_at")`.
- Tables use `@@map("<snake_plural>")`; multi-word fields use `@map("<snake_case>")`.
- Monetary values use `Decimal @db.Decimal(18, 2)`.
- Every unique constraint has a use case pre-check ([Section 9](#9-use-cases)).
- A reference from a ledger-scoped model to another ledger-scoped model (fund, category, bank account) is a composite relation: `@relation(fields: [<x>Id, ledgerId], references: [id, ledgerId], onDelete: Restrict, onUpdate: Restrict)`. The referenced model declares `@@unique([id, ledgerId])`. All 6 such relations follow this ([ARCHITECTURE.md §7](ARCHITECTURE.md#7-data-and-persistence)).
- When fields change, update the response schema and the entity example; `openapi-document.spec.ts` compares them with the Prisma model.

**SHOULD**
- Foreign keys: `<relation>Id String @map("<relation>_id")` with `@@index([<relation>Id])` (all 15 foreign keys follow this).
- Text columns: `@db.VarChar(n)`; names use 100.
- Ledger-scoped resources carry `ledgerId`.

**AVOID**
- Single-column foreign keys between ledger-scoped models: they allow references to another ledger.
- `onDelete: SetNull` on a ledger-scoped composite relation: it would also set `ledgerId` to `NULL`.
- Composite unique constraints that include a nullable column and rely on the database alone. PostgreSQL treats `NULL`s as distinct, so `@@unique([ledgerId, parentCategoryId, name])` does not prevent duplicate root categories.

---

## 18. Environment Variables

Workflow: [DEVELOPMENT.md §17](DEVELOPMENT.md#17-adding-a-new-environment-variable).

**MUST**
- Read variables through `env` from `src/config/env.ts`, declared with `required`, `optional` or `numberVar`.
- Add every variable to `.env.example`.
- If the Lambda needs it, add it to `provider.environment` in `serverless.yml` **and** to both deploy jobs in `.github/workflows/deploy.yml`.

**AVOID**
- `process.env` outside `config/env.ts` (`prisma.client.ts` does it).
- Declaring a variable `required` without wiring it for deployment. `AUTH_API_URL` is required but not passed to the Lambda by `serverless.yml` or CI.

---

## 19. Code That Should Not Be Copied

Confirmed issues present in the committed code. Do not use them as references.

| # | Pattern | Where | Why not | Instead |
|---|---|---|---|---|
| 1 | Update schema without `.strict()` | `updateLedgerSchema` | Unknown keys are silently stripped instead of rejected. | `.strict()` + refine ([§7](#7-schemas-and-validation)). |
| 2 | Uniqueness checked on the normalized value, original value persisted | `CreateFinancialCategoryUseCase` (`create(input)`), and its spec asserts it | The stored name differs from the checked one; its own update use case persists the normalized value. | Persist the normalized value ([§9](#9-use-cases)). |
| 3 | Uniqueness filter with possibly `undefined` key fields | `UpdateFinancialFundUseCase`, `UpdateFinancialCategoryUseCase` (`ledgerId: input.ledgerId`), `CreateFinancialCategoryUseCase` without `parentCategoryId` | Prisma drops `undefined` filters, so the check spans all ledgers or parents. | Check the complete key. No established implementation for partial updates yet. |
| 4 | Cross-field rule validated only when all fields are in the PATCH | `UpdateFinancialFundTransactionUseCase` (credit/debit) | Updating one amount can produce a state the create rule forbids. | No established pattern yet; do not replicate. |
| 5 | Unused `exists()` | All repositories | Dead code; 404 comes from `prismaCall`. | Omit unless a use case needs it ([§10](#10-repositories)). |
| 6 | `Promise<X \| null>` on get-by-id | All 9 `GetById…UseCase` | They throw `NotFoundError` and never return `null`. | Declare `Promise<X>`. |
| 7 | Debug `console.log` | `FinancialFundTransactionController.list` | Lint warning; leaks query data to logs. | No `console.log` ([§16](#16-formatting-and-static-analysis)). |
| 8 | Treating the request child container as request-scoped | `requestContainerMiddleware` comments | Nothing is registered with a scoped lifecycle. | Do not depend on per-request instances ([§11](#11-dependency-injection)). |
| 9 | 500 for malformed JSON bodies | `errorHandler` ignores the body parser's 400 | Accidental behavior, documented as `InternalError`. | Known gap ([§12](#12-error-handling)); no ad-hoc workarounds. |
| 10 | `new AuthService()` inside middleware | `authMiddleware` | Bypasses DI. | Constructor injection ([§11](#11-dependency-injection)). |
| 11 | `process.env` outside `config/env.ts` | `prisma.client.ts` | Skips the required/optional checks. | `env` from `config/env.ts` ([§18](#18-environment-variables)). |
| 12 | Route specs mounted at non-real paths; redundant `reflect-metadata` imports | Currency, description, payment-method route specs; 27 use case specs | Inconsistent; the import is already in the setup. | [§14](#14-tests). |
| 13 | `_amountDebit` assigned and unused without the disable comment | `financial-fund-transaction.routes.spec.ts` | Produces a lint warning. | [§14](#14-tests). |
| 14 | Migration name typo | `add_collum_financial_bank_account_id_…` | Typo. | `add_column_…`. |
| 15 | Previous OpenAPI model | Replaced in PR #18 | Diverged from runtime. | [§13](#13-openapi). |
| 16 | `./usecases/index`, `./../repositories/...` | `ledger.controller.ts`, the 9 create use cases | Inconsistent import paths. | [§15](#15-imports). |
| 17 | Composite unique with nullable column | `FinancialCategory` (`parentCategoryId`) | Duplicates allowed at root level. | [§17](#17-database-and-prisma). |

---

## 20. Pull Request / Definition of Done

- [ ] Code follows this document; any deviation is justified in the PR.
- [ ] Code is straightforward for another human developer to read and maintain.
- [ ] No unnecessary abstraction, indirection or architectural pattern was introduced.
- [ ] Validation schemas updated (`.strict()`, refine, idParamsSchema).
- [ ] OpenAPI updated if the contract changed (paths, response schemas, examples, status codes).
- [ ] Tests added/updated (use case specs, route spec, OpenAPI contract table for new modules).
- [ ] `npm run lint` (0 errors, no new warnings), `npm run check:ts`, `npm run test:run` pass.
- [ ] Migration committed and `prisma generate` run when `schema.prisma` changed.
- [ ] Env vars wired in `env.ts`, `.env.example`, `serverless.yml` and CI when added.
- [ ] Central registrations done: `shared/container`, `routes.ts`, `docs/openapi/modules.ts`, `tags.ts`.
- [ ] Diff reviewed; no debug code; nothing from [Section 19](#19-code-that-should-not-be-copied) copied.

---

## 21. Quick Reference

```
route ─► validateRequest ─► controllerAdapter ─► Controller ─► UseCase.execute
                                                                  │ @inject(<MODULE>_REPOSITORY)
                                                                  ▼
                                    prisma ◄─ <Module>Repository ◄─ I<Module>Repository
```

| Concern | Convention |
|---|---|
| Readability | Human-readable, explicit and maintainable code first |
| Design | Prefer simple, established OOP/patterns; avoid speculative architecture |
| Module isolation | No imports between modules |
| Endpoint | `validateRequest(...)` → `controllerAdapter(Controller, 'method')` |
| `:id` | `idParamsSchema` (CUID) |
| Success status | create 201, list/get/update 200, delete 204 |
| Controller | Use cases only; no logic, no try/catch |
| Use case | `@injectable`, one `execute`, one repository via token |
| Expected errors | Throw `BadRequestError` / `NotFoundError` / `ConflictError` |
| Database access | Repository implementation only; writes wrapped in `prismaCall` |
| DI | `registerSingleton(TOKEN, Repository)` in `shared/container/index.ts` |
| Create / update schemas | `.strict()`; update + at-least-one-field refine |
| DTOs | `z.infer<typeof schema>` |
| Response schemas | Explicit, Prisma model as JSON, `.openapi('<Module>')` |
| OpenAPI errors | `responseRef(...)` + `...globalErrorResponses` |
| Env vars | `env` from `config/env.ts` + `.env.example` + serverless + CI |
| Done | lint, check:ts, test:run green |
