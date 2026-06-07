# syntax=docker/dockerfile:1.7

# ---- deps stage: install workspace deps ----
FROM node:24-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

# Copy workspace metadata
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig
COPY apps/backend/package.json ./apps/backend/

RUN pnpm install --frozen-lockfile --filter backend... --ignore-scripts

# ---- build stage: prisma generate + nest build (compiles src + generated client) ----
FROM deps AS build
COPY apps/backend ./apps/backend
RUN cd apps/backend && pnpm exec prisma generate
RUN pnpm --filter backend build

# ---- runtime stage: production-only deps + compiled JS bundle ----
FROM node:24-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts

RUN pnpm install --frozen-lockfile --filter backend... --ignore-scripts

# Compiled app (src/generated/prisma compiled into dist too) from the build stage
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

WORKDIR /app/apps/backend
EXPOSE 4000

# Run migrate deploy then start the compiled app
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
