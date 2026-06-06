# CLAUDE.md

## Project

SimpleInvoice — pnpm + Turborepo monorepo. `apps/backend` (NestJS) is the active app; `apps/frontend` (React) is planned.

## Commands

```bash
pnpm dev:be                               # backend dev server (watch mode)
pnpm build                                # build all packages
pnpm test                                 # all tests
pnpm test:unit                            # unit tests only
pnpm test:integration                     # integration tests (Testcontainers)
pnpm lint                                 # oxlint
pnpm format                               # prettier
pnpm db:up                                # start postgres docker container
pnpm --filter backend prisma:migrate      # run Prisma migrations
pnpm --filter backend prisma:seed         # seed DB
pnpm --filter backend prisma:generate     # regenerate Prisma client
pnpm --filter backend type-check          # tsc --noEmit
```

## Stack

| Layer       | Technology                                        |
| ----------- | ------------------------------------------------- |
| Runtime     | Node.js 24, TypeScript 5                          |
| Backend     | NestJS 11, Prisma 7, PostgreSQL 16                |
| Validation  | nestjs-zod (Zod schemas — not class-validator)    |
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

## Docker

`docker compose up` starts postgres + backend + frontend.

Backend Dockerfile CMD: `prisma migrate deploy && node dist/main.cjs`

Ports: backend `4000`, postgres `5432`, frontend `8080`.
