#!/usr/bin/env bash
# Closdex VPS deploy script
# Run as root on 129.121.98.198:  bash /opt/closdex/infra/deploy.sh
# First-time setup: see infra/SETUP.md

set -euo pipefail

DEPLOY_DIR=/opt/closdex
ENV_FILE=$DEPLOY_DIR/.env

# ── Sanity checks ────────────────────────────────────────────────────────────
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found. Copy infra/env.example and fill in values."
  exit 1
fi

echo "==> Loading env"
set -a; source "$ENV_FILE"; set +a

cd "$DEPLOY_DIR"

# ── Pull latest code ─────────────────────────────────────────────────────────
echo "==> git pull"
git pull --ff-only origin main

# ── Install deps ─────────────────────────────────────────────────────────────
echo "==> pnpm install"
pnpm install --no-frozen-lockfile

# ── Prisma: generate client + run migrations ─────────────────────────────────
echo "==> prisma generate"
pnpm --filter @closdex/db generate

echo "==> prisma migrate deploy"
pnpm --filter @closdex/db exec prisma migrate deploy

# ── Build API ────────────────────────────────────────────────────────────────
echo "==> Build API"
pnpm --filter @closdex/api build

# ── Build web (CRITICAL: unset NEXT_PUBLIC_API_URL so rewrites are active) ───
echo "==> Build web"
unset NEXT_PUBLIC_API_URL
pnpm --filter @closdex/web build

# Copy public + static into standalone output
cp -r "$DEPLOY_DIR/apps/web/public" "$DEPLOY_DIR/apps/web/.next/standalone/public"
cp -r "$DEPLOY_DIR/apps/web/.next/static" "$DEPLOY_DIR/apps/web/.next/standalone/.next/static"

# ── Restart services ─────────────────────────────────────────────────────────
echo "==> Restarting services"
systemctl restart closdex-api
systemctl restart closdex-web

echo ""
echo "✓ Deploy complete. API on :4000, web on :3001"
systemctl --no-pager status closdex-api closdex-web | grep -E "Active:|closdex"
