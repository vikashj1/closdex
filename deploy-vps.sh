#!/usr/bin/env bash
# deploy-vps.sh — run this on the VPS to pull latest code and restart services.
# Usage: bash deploy-vps.sh
set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "→ Repo: $REPO_DIR"

echo "→ Pulling latest code..."
git pull origin main

echo "→ Installing dependencies..."
pnpm install --frozen-lockfile 2>/dev/null || npm install --legacy-peer-deps

echo "→ Syncing DB schema (prisma db push — no migrations folder yet)..."
cd packages/db
pnpm exec prisma generate 2>/dev/null || npx prisma generate
pnpm exec prisma db push 2>/dev/null || npx prisma db push
cd "$REPO_DIR"

echo "→ Building API..."
cd apps/api
pnpm build 2>/dev/null || npm run build
cd "$REPO_DIR"

echo "→ Building web..."
cd apps/web
pnpm build 2>/dev/null || npm run build
cd "$REPO_DIR"

echo "→ Restarting services..."
if systemctl is-active --quiet closdex-api 2>/dev/null; then
  systemctl restart closdex-api
  echo "   closdex-api restarted"
fi
if systemctl is-active --quiet closdex-web 2>/dev/null; then
  systemctl restart closdex-web
  echo "   closdex-web restarted"
fi

echo ""
echo "✓ Deploy complete. Checking status..."
systemctl status closdex-api --no-pager -l 2>/dev/null | head -5 || true
systemctl status closdex-web --no-pager -l 2>/dev/null | head -5 || true
