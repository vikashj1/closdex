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

cd "$DEPLOY_DIR"

# ── Pull latest code ─────────────────────────────────────────────────────────
echo "==> git pull"
git pull --ff-only origin main

# ── Install deps (before sourcing env so NODE_ENV=production doesn't skip devDeps) ──
echo "==> pnpm install"
pnpm install --no-frozen-lockfile --ignore-scripts=false

# ── Load env (after install so devDeps are installed regardless of NODE_ENV) ─
echo "==> Loading env"
set -a; source "$ENV_FILE"; set +a

# ── Prisma: generate client + run migrations ─────────────────────────────────
echo "==> prisma generate"
cd packages/db && npx prisma generate && cd "$DEPLOY_DIR"

echo "==> prisma migrate deploy"
cd packages/db && npx prisma migrate deploy && cd "$DEPLOY_DIR"

# ── Build API ────────────────────────────────────────────────────────────────
echo "==> Build API"
pnpm --filter @closdex/api build

# ── Build web (CRITICAL: unset NEXT_PUBLIC_API_URL so rewrites are active) ───
echo "==> Build web"
unset NEXT_PUBLIC_API_URL
pnpm --filter @closdex/web build

# Copy public + static into standalone output
cp -r "$DEPLOY_DIR/apps/web/public" "$DEPLOY_DIR/apps/web/.next/standalone/public" 2>/dev/null || true
cp -r "$DEPLOY_DIR/apps/web/.next/static" "$DEPLOY_DIR/apps/web/.next/standalone/.next/static" 2>/dev/null || true

# ── Install + reload systemd services ────────────────────────────────────────
echo "==> Installing systemd services"
cp "$DEPLOY_DIR/infra/closdex-api.service" /etc/systemd/system/
cp "$DEPLOY_DIR/infra/closdex-web.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable closdex-api closdex-web

echo "==> Restarting services"
systemctl restart closdex-api
systemctl restart closdex-web

echo ""
echo "✓ Deploy complete. API on :4000, web on :3001"
systemctl --no-pager status closdex-api closdex-web | grep -E "Active:|closdex"
