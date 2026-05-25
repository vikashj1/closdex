# Closdex VPS First-Time Setup

VPS: `129.121.98.198` (Bluehost)

## 1. Prerequisites

```bash
# On the VPS as root:

# Node 20 + pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pnpm@9

# Postgres 16
apt-get install -y postgresql-16
# Create DB + user:
sudo -u postgres psql -c "CREATE USER closdex WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE closdex OWNER closdex;"

# Redis 7
apt-get install -y redis-server
systemctl enable --now redis-server
```

## 2. Clone the repo

```bash
mkdir -p /opt/closdex
cd /opt
git clone https://github.com/YOUR_ORG/closdex.git closdex
# OR if already cloned: git -C /opt/closdex pull
```

## 3. Configure environment

```bash
cp /opt/closdex/infra/env.example /opt/closdex/.env
nano /opt/closdex/.env
# Fill in: DATABASE_URL password, JWT_SECRET (64 random chars), OPENAI_API_KEY (rotated NIM key)
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 4. Install systemd services

```bash
cp /opt/closdex/infra/closdex-api.service /etc/systemd/system/
cp /opt/closdex/infra/closdex-web.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable closdex-api closdex-web
```

## 5. Run the deploy script

```bash
bash /opt/closdex/infra/deploy.sh
```

This installs deps, runs `prisma migrate deploy`, builds API + web, and starts services.

## 6. Traefik routing

Ensure `/opt/hostedapps/dynamic/closdex.toml` routes:
- All traffic for `closdex.in` → `http://127.0.0.1:3001` (Next.js)
- Next.js rewrites `/api/*` → `http://127.0.0.1:4000/api/*` internally — no separate Traefik rule needed for the API

## 7. Verify

```bash
# API health
curl http://localhost:4000/api/health

# Web
curl -I http://localhost:3001/login

# Services
systemctl status closdex-api closdex-web
```

## Seeding demo data (optional)

```bash
cd /opt/closdex
pnpm --filter @closdex/db seed
```

## Re-deploy after code changes

```bash
bash /opt/closdex/infra/deploy.sh
```
