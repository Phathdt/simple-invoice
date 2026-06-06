# CLAUDE.md

## Project

SimpleInvoice — pnpm + Turborepo monorepo. `apps/backend` (NestJS), `apps/frontend` (React + Vite), and `apps/e2e` (Cucumber + Playwright) are all active.

## Commands

```bash
pnpm dev:be                               # backend dev server (watch mode)
pnpm dev:fe                               # frontend dev server (Vite)
pnpm build                                # build all packages
pnpm test                                 # all tests
pnpm test:unit                            # unit tests only
pnpm test:integration                     # integration tests (Testcontainers)
pnpm lint                                 # oxlint
pnpm format                               # prettier
pnpm db:up                                # start postgres docker container
pnpm openapi:export                       # export OpenAPI spec → docs/openapi.yaml
pnpm api:generate                         # export spec + run Orval (regen FE client)
pnpm --filter frontend generate:api       # run Orval only (spec must exist)
pnpm --filter backend prisma:migrate      # run Prisma migrations
pnpm --filter backend prisma:seed         # seed DB
pnpm --filter backend prisma:generate     # regenerate Prisma client
pnpm --filter backend type-check          # tsc --noEmit
pnpm --filter e2e test                    # run Cucumber + Playwright e2e (servers must be up)
pnpm --filter e2e install:browsers        # install Playwright chromium (one-time)
```

## Stack

| Layer       | Technology                                        |
| ----------- | ------------------------------------------------- |
| Runtime     | Node.js 24, TypeScript 5                          |
| Backend     | NestJS 11, Prisma 7, PostgreSQL 16                |
| Frontend    | React 19, Vite, TanStack Query, React Router 7    |
| Validation  | nestjs-zod (Zod schemas — not class-validator)    |
| API Client  | Orval (OpenAPI → React Query hooks + Zod schemas) |
| Auth        | @nestjs/jwt + bcryptjs                            |
| Logging     | nestjs-pino                                       |
| Testing     | Vitest + @testcontainers/postgresql               |
| Build       | SWC (@swc-node/register), tsc-alias for aliases   |
| Lint/Format | oxlint, Prettier, lefthook                        |

## Module Architecture

Each module under `src/modules/` follows this structure:

```
<module>/
├── domain/
│   ├── dto/           # Zod-validated input schemas via createZodDto()
│   ├── errors/        # Domain error classes
│   └── interfaces/    # Service + repository interfaces (no framework deps)
├── application/
│   └── services/      # Business logic (implements domain interfaces)
├── infrastructure/
│   ├── http/          # NestJS controllers
│   └── repositories/  # Prisma repository implementations
└── <module>.module.ts
```

## Key Conventions

- DTOs use `nestjs-zod` — always extend `createZodDto(schema)`, never use `class-validator` decorators.
- Repository interfaces live in `domain/interfaces/`; Prisma implementations in `infrastructure/repositories/`.
- DI tokens are the interface class itself (e.g. `IAuthService`, `IUserRepository`) — no string tokens.
- Path alias `@modules/<name>` maps to `src/modules/<name>`.
- Integration tests use `apps/backend/src/test-utils/setup-postgres.ts` (Testcontainers) and run under `vitest.integration.config.ts`.
- Unit test files: `*.spec.ts`; integration test files: `*.integration.spec.ts`.

## Frontend

`apps/frontend` — Vite + React 19 + TypeScript. Path alias `@/*` → `src/*`.

```
apps/frontend/src/
├── api/
│   ├── axios-instance.ts      # Custom Axios mutator (JWT attach, 401 redirect)
│   └── generated/             # Orval output — DO NOT edit by hand
│       ├── models/            # TS interfaces per DTO
│       ├── <tag>/<tag>.ts     # React Query hooks + Axios fns + query keys
│       └── <tag>/<tag>.zod.ts # Zod validation schemas per tag
├── components/                # Shared presentational UI (app-header, button, status-badge)
├── features/                  # Feature-based modules (split by domain)
│   ├── auth/                  # login-page + hooks/{use-login, use-session-validation}
│   └── invoice/               # list/detail/create pages + form + hooks/{use-invoice-*}
├── lib/                       # auth token helpers
├── routes/                    # Thin TanStack Router wiring (createRoute + beforeLoad guard)
└── main.tsx
```

- Feature-based layout: each `features/<name>/` owns its page components, `hooks/` (business logic + tests), and feature-local files.
- Route files in `src/routes/` stay thin — they only wire `createRoute` (path, `beforeLoad` auth guard) and render the imported feature page. No screen logic lives there.
- Shared UI in `components/` and token helpers in `lib/auth.ts` are cross-feature.
- `features/auth/hooks/use-session-validation` calls `GET /auth/me` on app load to validate the persisted token on refresh.

## API Client Pipeline (type-safe, generated)

The frontend API client is generated from the backend's OpenAPI spec — never hand-write API types/hooks.

```
NestJS (@nestjs/swagger + nestjs-zod) → docs/openapi.yaml → Orval → React Query hooks + Zod schemas
```

- Backend exposes Swagger UI at `/api/docs`. `cleanupOpenApiDoc()` (from `nestjs-zod`) resolves Zod DTOs into OpenAPI schemas.
- `apps/backend/src/openapi-export.ts` boots the app headless and writes `docs/openapi.yaml` (committed, so CI/FE can generate without a running backend).
- `apps/frontend/orval.config.ts` has two targets: `api` (React Query + Axios, `tags-split`) and `api-zod` (Zod schemas, `.zod.ts`).
- After changing any backend controller/DTO, run `pnpm api:generate` to refresh the FE client.
- FE uses **Zod 4** to match the backend; the Orval mutator lives at `src/api/axios-instance.ts`.

## Environment Variables

| Variable        | Default | Description                       |
| --------------- | ------- | --------------------------------- |
| `DATABASE_URL`  | —       | PostgreSQL connection string      |
| `JWT_SECRET`    | —       | JWT signing secret                |
| `JWT_EXPIRES_IN`| `3600`  | Token TTL in seconds              |
| `PORT`          | `4000`  | HTTP server port                  |
| `NODE_ENV`      | —       | `development` or `production`     |
| `LOG_LEVEL`     | `info`  | Pino log level                    |

## Prisma

- Schema: `apps/backend/prisma/schema.prisma`
- Generated client: `apps/backend/prisma/generated/` (gitignored; regenerated on build)
- Config: `apps/backend/prisma.config.ts`
- Seed users: `*@simple-invoice.dev` / `password123` (alice, bob, carol, dave, eve)

## E2E Tests

`apps/e2e` — Cucumber + Playwright, Page Object Model.

```
apps/e2e/
├── config/         # test.config.ts (presets), urls.config.ts (routes + REST API)
├── page-objects/   # one class per screen; selectors use data-testid
├── tests/
│   ├── features/   # *.feature (Gherkin) + *.steps.ts per scenario group
│   └── support/    # world.ts, browser-hooks.ts, api-helpers.ts (REST setup)
└── utils/          # browser-factory.ts, logger.ts
```

- Selectors use `data-testid` on the frontend; form fields fall back to `[name="..."]`.
- API setup (login, seed invoice) goes through REST helpers in `tests/support/api-helpers.ts`.
- Requires backend (`:4000`) + frontend (`:5173`) running and the DB seeded.
- Run the browser install once: `pnpm --filter e2e install:browsers`.

## Health Check

- `GET /health` is a `@Public()` endpoint returning `{ status: 'ok' }`.
- Used by the Docker Compose backend healthcheck.

## Docker

`docker compose up` starts postgres + backend + frontend.

Backend Dockerfile CMD: `prisma migrate deploy && node dist/main.cjs`. Frontend builds a static SPA served by nginx (`apps/frontend/Dockerfile` + `nginx.conf`); the build bakes in `VITE_API_BASE_URL` (default `http://localhost:4000`).

Ports: backend `4000`, postgres `5432`, frontend `8080`.
