# ── Stage 1: install all deps ────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN npm install -g pnpm@9
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json            ./apps/api/
COPY packages/db/package.json         ./packages/db/

RUN pnpm install --frozen-lockfile

# ── Stage 2: generate Prisma client + build NestJS ───────────────────────
FROM deps AS builder
COPY . .
RUN pnpm --filter @closdex/db exec prisma generate
RUN pnpm --filter @closdex/api build

# ── Stage 3: lean production image ───────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9
WORKDIR /app

# Copy workspace manifest so pnpm can resolve workspace packages
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json            ./apps/api/
COPY packages/db/package.json         ./packages/db/

# Production deps only
RUN pnpm install --frozen-lockfile --prod

# Compiled API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Prisma schema + generated client (needed at runtime for migrations)
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/node_modules/.pnpm  ./node_modules/.pnpm
COPY --from=builder /app/node_modules/@closdex ./node_modules/@closdex

WORKDIR /app/apps/api
EXPOSE 4000

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy --schema=../../packages/db/prisma/schema.prisma && node dist/main"]
