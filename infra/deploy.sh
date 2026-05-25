#!/usr/bin/env bash
# Closdex VPS deploy script
# Run as root on 129.121.98.198:  bash /opt/closdex/infra/deploy.sh

set -euo pipefail

DEPLOY_DIR=/opt/closdex
ENV_FILE=$DEPLOY_DIR/.env

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found."
  exit 1
fi

cd "$DEPLOY_DIR"

# ── Pull latest code ──────────────────────────────────────────────────────────
echo "==> git pull"
git pull --ff-only origin main

# ── Install deps (before sourcing env so devDeps aren't skipped) ─────────────
echo "==> pnpm install"
NODE_ENV=development pnpm install --no-frozen-lockfile

# ── Load env ──────────────────────────────────────────────────────────────────
echo "==> Loading env"
set -a; source "$ENV_FILE"; set +a

# ── Prisma generate + migrate (pin to v5 to match schema format) ─────────────
echo "==> prisma generate"
cd "$DEPLOY_DIR/packages/db"
npx --yes prisma@5 generate

echo "==> prisma migrate deploy"
npx --yes prisma@5 migrate deploy

cd "$DEPLOY_DIR"

# ── Build API ─────────────────────────────────────────────────────────────────
echo "==> Build API"
cd "$DEPLOY_DIR/apps/api"
node "$DEPLOY_DIR/node_modules/.bin/nest" build 2>/dev/null \
  || node "$DEPLOY_DIR/apps/api/node_modules/.bin/nest" build 2>/dev/null \
  || ./node_modules/.bin/nest build \
  || npx --yes @nestjs/cli@10 build

cd "$DEPLOY_DIR"

# ── Build web (NEXT_PUBLIC_API_URL must NOT be set) ───────────────────────────
echo "==> Build web"
unset NEXT_PUBLIC_API_URL
cd "$DEPLOY_DIR/apps/web"
node "$DEPLOY_DIR/node_modules/.bin/next" build 2>/dev/null \
  || npx --yes next@14 build

# Copy static files into standalone
cp -r "$DEPLOY_DIR/apps/web/public" "$DEPLOY_DIR/apps/web/.next/standalone/public" 2>/dev/null || true
cp -r "$DEPLOY_DIR/apps/web/.next/static" "$DEPLOY_DIR/apps/web/.next/standalone/.next/static" 2>/dev/null || true

cd "$DEPLOY_DIR"

# ── Install + reload systemd services ────────────────────────────────────────
echo "==> Installing systemd services"
cp "$DEPLOY_DIR/infra/closdex-api.service" /etc/systemd/system/
cp "$DEPLOY_DIR/infra/closdex-web.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable closdex-api closdex-web 2>/dev/null || true

echo "==> Restarting services"
systemctl restart closdex-api
systemctl restart closdex-web

echo ""
echo "✓ Deploy complete. API on :4000, web on :3001"
systemctl --no-pager status closdex-api closdex-web | grep -E "Active:|closdex"
