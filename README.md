# SimpleInvoice

A full-stack invoice management application built with NestJS (backend) and ReactJS (frontend), organized as a pnpm + Turborepo monorepo.

## Architecture

```
simple-invoice/
├── apps/
│   ├── backend/           # NestJS REST API
│   │   ├── prisma/         # Schema, migrations, seed
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/   # JWT authentication
│   │       │   ├── user/   # User management
│   │       │   └── invoice/ # Invoice CRUD
│   │       └── main.ts
│   ├── frontend/          # React + Vite SPA
│   │   └── src/
│   │       ├── api/        # Orval-generated client (hooks + Zod) + Axios mutator
│   │       ├── components/ # Shared UI (header, button, status badge)
│   │       ├── hooks/      # Business logic (login, invoice list/detail/create, session)
│   │       ├── routes/     # TanStack Router route components
│   │       └── main.tsx
│   └── e2e/               # Cucumber + Playwright end-to-end tests
│       ├── config/         # Test + URL config
│       ├── page-objects/   # Page object models (data-testid based)
│       └── tests/          # Feature files + step definitions
├── packages/
│   └── tsconfig/           # Shared TypeScript config
├── docs/
│   └── openapi.yaml        # Generated OpenAPI spec (source for FE client)
├── docker-compose.yml
└── README.md
```

The backend follows a layered DDD-style architecture per module:

- **domain/** — interfaces, DTOs, errors (no framework dependencies)
- **application/services/** — business logic
- **infrastructure/** — Prisma repositories, HTTP controllers

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose (for the containerized setup)

## Running Locally (without Docker)

### 1. Start PostgreSQL

```bash
pnpm db:up
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

Minimum required variables:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/simple-invoice
JWT_SECRET=dev-secret
PORT=4000
```

### 4. Run database migrations

```bash
pnpm --filter backend prisma:migrate
```

### 5. Seed the database

```bash
pnpm --filter backend prisma:seed
```

### 6. Start the backend

```bash
pnpm dev:be
```

API available at `http://localhost:4000`.  
Swagger UI at `http://localhost:4000/api/docs`.

### 7. Start the frontend

```bash
pnpm dev:fe
```

Frontend dev server at `http://localhost:5173` (proxies `/api` to the backend on port 4000).

## Type-Safe API Client (Orval)

The frontend never hand-writes API types or hooks. They are generated from the backend's OpenAPI spec:

```
NestJS (@nestjs/swagger) → docs/openapi.yaml → Orval → React Query hooks + Zod schemas
```

```bash
pnpm openapi:export    # boot backend headless, write docs/openapi.yaml
pnpm api:generate      # export spec + run Orval (one command)
```

Generated output lands in `apps/frontend/src/api/generated/` (React Query hooks, TS models, Zod schemas). Re-run `pnpm api:generate` after changing any backend controller or DTO. The committed `docs/openapi.yaml` lets the frontend regenerate without a running backend.

## Running with Docker

```bash
docker compose up
```

Starts PostgreSQL, the backend, and the frontend (once available) in a single command.

| Service  | URL                            |
| -------- | ------------------------------ |
| Backend  | http://localhost:4000          |
| Swagger  | http://localhost:4000/api/docs |
| Frontend | http://localhost:8080          |
| Postgres | localhost:5432                 |

The Docker build runs `prisma migrate deploy` automatically on startup. To seed after startup:

```bash
docker compose exec backend pnpm prisma:seed
```

## Default Login Credentials

The seed script creates the following accounts (all share the same password):

| Email                    | Password    |
| ------------------------ | ----------- |
| alice@simple-invoice.dev | password123 |
| bob@simple-invoice.dev   | password123 |
| carol@simple-invoice.dev | password123 |
| dave@simple-invoice.dev  | password123 |
| eve@simple-invoice.dev   | password123 |

## Running Tests

```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests only (requires Docker for Testcontainers)
pnpm test:integration
```

### End-to-End Tests (Cucumber + Playwright)

E2E tests live in `apps/e2e` and drive a real browser against the running app.

```bash
# One-time: install the Playwright browser
pnpm --filter e2e install:browsers
cp apps/e2e/.env.example apps/e2e/.env
```

With PostgreSQL seeded and both servers running (`pnpm dev:be`, `pnpm dev:fe`):

```bash
pnpm --filter e2e test            # run all scenarios (headless)
pnpm --filter e2e test:headed     # run with a visible browser
pnpm --filter e2e test:smoke      # @smoke scenarios only
pnpm --filter e2e test:auth       # @auth scenarios only
pnpm --filter e2e test:invoice    # @invoice scenarios only
```

Page objects use `data-testid` selectors; failing scenarios save a Playwright trace under `apps/e2e/test-results/traces/`.

## Available Scripts

| Command                                | Description                     |
| -------------------------------------- | ------------------------------- |
| `pnpm dev:be`                          | Start backend in watch mode     |
| `pnpm build`                           | Build all packages              |
| `pnpm test`                            | Run all tests                   |
| `pnpm lint`                            | Lint with oxlint                |
| `pnpm format`                          | Format with Prettier            |
| `pnpm db:up`                           | Start PostgreSQL container      |
| `pnpm db:down`                         | Stop PostgreSQL container       |
| `pnpm --filter backend prisma:migrate` | Run Prisma migrations           |
| `pnpm --filter backend prisma:seed`    | Seed the database               |
| `pnpm --filter backend prisma:studio`  | Open Prisma Studio              |

## Design Decisions

- **Monorepo** with pnpm workspaces and Turborepo for task orchestration and build caching.
- **DDD-style layering** per module: domain interfaces stay framework-agnostic; infrastructure holds Prisma and HTTP adapters.
- **Zod validation** via `nestjs-zod` instead of `class-validator` — better type inference and composability with TypeScript.
- **Customer embedded on Invoice** — no separate `customers` table; simplifies queries for a single-owner invoice context.
- **Overdue is derived, not stored** — computed at read time: `status != Paid AND dueDate < today`. Only `Draft`, `Pending`, and `Paid` are persisted.
- **JWT stateless auth** — no refresh tokens for this scope; expiry configurable via `JWT_EXPIRES_IN` env var (default 3600 s).
- **Vitest** over Jest — faster, native ESM support, compatible with the SWC transform already in use.
- **Testcontainers** for integration tests — spins up a real PostgreSQL instance; no mocks at the database layer.

## Known Limitations

- No refresh token mechanism; sessions expire after the configured TTL.
- Password reset, email verification, and multi-factor authentication are out of scope for this assessment.
- Invoice creation implements exactly one line item, as required by the assessment, while the database schema remains ready for multiple items in the future.
