# manager-api

> **Personal project.** manager-api is a non-commercial project I use as a study lab: a place to practice
> architecture, testing, documentation and new technologies on a real application that manages my own finances.
> It is not a product and offers no support; things may change as I experiment.

REST API of the Manager project. It currently implements the **financial** domain: ledgers, funds (cash), bank accounts, chart of accounts (categories), payables/receivables and fund transactions. The domain is described in [docs/DOMAIN.md](docs/DOMAIN.md). Other business modules are planned.

**Stack:** TypeScript · Express 4 · Zod · tsyringe · Prisma 7 (PostgreSQL) · Vitest · AWS Lambda (Serverless Framework).

## Quick Start

Requirements: Node.js 24, npm and a PostgreSQL database.

```bash
npm install
```

Create `.env` from [`.env.example`](.env.example) (database URLs, `API_KEY`, `AUTH_API_URL`). Then:

```bash
npm run prisma:generate
```

```bash
npm run dev
```

The API listens on `http://localhost:<PORT>/v1/api`. Every request needs:

- `x-api-key: <API_KEY>`
- `Authorization: Bearer <token>`, validated by the authentication API at `AUTH_API_URL`.

Set `DOCS_ENABLED=true` to serve Swagger UI at `http://localhost:<PORT>/docs`. Docs are served by the local server only.

Full setup, commands, migrations and workflow: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Checks

```bash
npm run lint
```

```bash
npm run check:ts
```

```bash
npm run test:run
```

CI runs the same checks on pull requests to `develop`/`main` and before every deploy.

## Deployment

A push to `develop` deploys the `dev` stage; a push to `main` deploys `prod` (GitHub Actions + Serverless). Database migrations are **not** applied by the pipeline; they are applied manually per stage.

## Documentation

| Document | Purpose |
|---|---|
| [docs/DOMAIN.md](docs/DOMAIN.md) | Business concepts and rules |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the system is built today |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | How to work in the repository |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Rules for new code |
| [CLAUDE.md](CLAUDE.md) | Instructions for Claude Code |

## License

[MIT](LICENSE) © Henrique Weidebach
