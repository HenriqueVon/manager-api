# Manager API — Claude Instructions

How to operate in this repository. The detailed rules live in `docs/`; this file does not repeat them.

## 1. Read Before Changing Code

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the system is built today, including known inconsistencies (§15).
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md): how to work here, with commands, step-by-step guides and pitfalls.
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md): the rules new code must follow (MUST / SHOULD / AVOID).
- [docs/DOMAIN.md](docs/DOMAIN.md): business concepts and rules per module, marked as enforced, stored only or open.

Read the sections relevant to the task before editing.

## 2. Source of Truth

- **Committed code is the source of truth.** Infer architecture, patterns and conventions from `HEAD`.
- Uncommitted local changes are not official architecture. Do not copy them, document them or treat them as patterns. Consider them only when the user explicitly asks.
- If the local branch is behind or diverged from its remote, report it before making changes. Do not pull, merge, rebase or switch to the remote state unless the user explicitly asks.
- When the docs and the code disagree, the code wins. Report the mismatch.
- A documented architectural decision may intentionally describe a target rule not yet implemented. Do not silently treat it as current runtime behavior.

## 3. Change Discipline

- Make minimal, focused changes that do only what the task asks.
- Do not refactor, rename or "improve" code outside the scope.
- Do not change HTTP contracts (paths, status codes, request/response shapes) unless the task requires it.
- Do not change business rules implicitly. Any behavior change must be stated in the summary.
- Do not introduce new abstractions, helpers or dependencies without a demonstrated need.
- Do not copy known bugs or exceptions as patterns: [CONVENTIONS.md §19](docs/CONVENTIONS.md#19-code-that-should-not-be-copied), [ARCHITECTURE.md §15](docs/ARCHITECTURE.md#15-known-architectural-inconsistencies).
- Write boring, readable code for the next human developer. Prefer simple, established designs (standard OOP, composition, well-known patterns) over clever or highly abstract solutions.
- Do not introduce architectural patterns (DDD, CQRS, event sourcing, Hexagonal, extra Clean Architecture layers, custom frameworks) for architectural purity. Details: [CONVENTIONS.md §2 — Design and Readability](docs/CONVENTIONS.md#design-and-readability).

## 4. Architecture Guardrails

Details: [ARCHITECTURE.md](docs/ARCHITECTURE.md).

- Flow: route → `validateRequest` (Zod) → controller → use case → repository → Prisma.
- Controllers contain no business logic; they call use cases and set the status.
- Use cases never access Prisma; they depend on the module's repository interface through its token.
- Only repository implementations access the database.
- Modules never import other modules unless there is an explicit architectural decision.
- Dependency injection follows the documented tsyringe pattern. Do not rely on request-scoped instances.
- Zod validates the HTTP edge.
- Cross-record data integrity rules must follow the documented architecture and approved decisions. Do not assume they belong in database constraints or application code when the approach is still undecided.

## 5. Conventions

Follow [docs/CONVENTIONS.md](docs/CONVENTIONS.md):

- **MUST**: always respect.
- **SHOULD**: follow unless there is a justified exception. State the justification.
- **AVOID**: never reproduce in new code, even if existing code does it.

## 6. OpenAPI / HTTP Contracts

- Any contract change (route, schema, status code, error) must update the corresponding OpenAPI contract and response schema when applicable, following the current documented OpenAPI architecture.
- Documented status codes must match what the runtime returns. Do not document aspirational behavior.
- Request, response and error schemas stay aligned with the code. Error bodies use the shared responses.
- Security in the document must reflect the real middleware chain.
- Do not trust existing documentation blindly; verify against the code.
- The OpenAPI specs (`src/docs/openapi/__tests__/`) must pass.

## 7. Database / Prisma

- Every `schema.prisma` change ships with a new migration; then run `npm run prisma:generate`.
- Never edit a migration folder that already exists; create a new one.
- When a schema change requires a migration, prepare the migration artifacts without applying them to a user database whenever the tooling allows it. If generating the migration requires writing to a shadow, local or develop database, ask for approval first.
- **Ask before any database write, local or develop.** This covers applying migrations (`prisma:migrate:dev`, `prisma migrate deploy`, `db push`), seeds and SQL `INSERT`/`UPDATE`/`DELETE`. First show the migration or SQL to be executed and the target database (never the credentials), then wait for explicit approval so the user can review it.
- Never write to the production database. The user applies production changes.
- Read-only queries: state the query and the target database before running them.
- Check the impact on constraints, relations and referential actions, and on existing data. Provide diagnostic queries when a constraint could fail.
- Integrity changes need tests. When behavior can only be verified against a real database (no DB tests exist yet), say so explicitly.

## 8. Tests and Verification

Before reporting a change as done, run and report each step:

1. `npm run lint`: 0 errors, no new warnings.
2. `npm run check:ts`.
3. Related tests: `npm run test:run -- <path>`.
4. Full suite: `npm run test:run`, when the change is not trivially isolated.
5. `git diff` / `git status`: only intended files changed; no stray files.
6. No debug code (`console.log`, commented code); no known exception copied.

Use only the scripts in `package.json`. `npm run test` starts watch mode; use `test:run`. Never run the `deploy:*`, `remove:*` or `logs:*` scripts. "It compiles" is not done.

## 9. Documentation Updates

Update documentation only when the change actually alters:

- architecture → `docs/ARCHITECTURE.md`;
- development workflow → `docs/DEVELOPMENT.md`;
- a convention → `docs/CONVENTIONS.md`;
- a business rule or domain concept → `docs/DOMAIN.md`.

Internal changes that do not alter documented behavior or rules do not require doc updates.

## 10. Git Rules

- Do not commit.
- Do not push. A push to `develop` or `main` triggers a deploy.
- Create a branch only when the user asks. Otherwise, do not switch, create or delete branches.
- Do not force push, rebase, amend or otherwise rewrite history.
- Do not run destructive commands (`reset --hard`, `clean`, `checkout -- <file>` on uncommitted work, deleting files) without explicit authorization.
- Never print or commit `.env` contents.
- Do not create GitHub issues, modify Projects, labels, milestones or repository settings unless the user explicitly asks.

The user reviews and commits manually.

## 11. Scope and Safety

- If the task is ambiguous, inspect the code first, then ask. Do not guess.
- Do not assume product intent (e.g. single-user vs multi-user, balance rules). Check the open questions in [docs/DOMAIN.md](docs/DOMAIN.md); if the answer is not there, ask.
- Open decisions are decisions, not tasks. Present options instead of implementing one; see issues labeled `decision`.
- Do not fix several technical-debt items in one task unless asked; mention them instead.
- Preserve existing behavior outside the scope.

## 12. Completion Checklist

- [ ] Scope respected; no unrelated changes
- [ ] Architecture guardrails respected
- [ ] Conventions respected; nothing from AVOID copied
- [ ] Code is straightforward for another human developer to read and maintain
- [ ] No unnecessary abstraction, indirection or architectural pattern introduced
- [ ] OpenAPI updated if the contract changed
- [ ] Migration added if `schema.prisma` changed; client regenerated; applied only after the user approved it
- [ ] Tests added/updated
- [ ] lint ok · type check ok · tests ok (results shown)
- [ ] Diff reviewed; no unintended files
- [ ] Docs updated only where needed
- [ ] No commit, no push

## 13. Useful References

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- [docs/DOMAIN.md](docs/DOMAIN.md)
