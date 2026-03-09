# Figaro Barbershop — VPS Deployment Guide

> Last updated: 2026-03-08
> Server: Hostinger KVM 2 VPS

## VPS Overview

| Detail     | Value                               |
| ---------- | ----------------------------------- |
| Provider   | Hostinger                           |
| Plan       | KVM 2                               |
| OS         | Ubuntu 24.04 LTS                    |
| IP         | 72.62.200.30                        |
| Hostname   | srv1418044.hstgr.cloud              |
| SSH        | `ssh root@72.62.200.30` (port 2222) |
| CPU        | 2 cores                             |
| RAM        | 8 GB                                |
| Disk       | 100 GB SSD                          |
| Bandwidth  | 8 TB                                |
| Location   | United States — Phoenix             |
| Expiration | 2026-03-27 (auto-renewal on)        |

## Installed Software

| Software   | Version  | Purpose                                    |
| ---------- | -------- | ------------------------------------------ |
| Node.js    | v22.22.0 | JavaScript runtime                         |
| pnpm       | v10.31.0 | Package manager                            |
| PM2        | —        | Process manager (auto-restart, monitoring) |
| NGINX      | —        | Reverse proxy, SSL termination             |
| PostgreSQL | 16.13    | Database server                            |
| Certbot    | —        | Let's Encrypt SSL certificates             |
| UFW        | —        | Firewall                                   |
| Git        | —        | Version control / deployment pulls         |

## Current Site Map

| Port | PM2 Name        | Directory               | Domain                         | NGINX Config                              |
| ---- | --------------- | ----------------------- | ------------------------------ | ----------------------------------------- |
| 3000 | _(raw process)_ | —                       | orcachildinthewild.com         | `/etc/nginx/sites-available/ocinw`        |
| 3001 | colourparlor    | `/var/www/colourparlor` | thecolourparlor.com            | `/etc/nginx/sites-available/colourparlor` |
| 3002 | builtbybas      | `/var/www/builtbybas`   | builtbybas.com                 | `/etc/nginx/sites-available/builtbybas`   |
| 3003 | umami           | `/var/www/umami`        | analytics.builtbybas.com       | `/etc/nginx/sites-available/analytics`    |
| 3004 | figaro          | `/var/www/figaro`       | figaroleucadia.com _(pending)_ | _(pending — direct IP access for now)_    |

**Next available port: 3005**

## Firewall (UFW)

Allowed ports:

- `80/tcp` — HTTP (NGINX)
- `443/tcp` — HTTPS (NGINX + SSL)
- `2222/tcp` — SSH
- `3003/tcp` — Umami analytics (direct)
- `3004/tcp` — Figaro (direct, temporary until domain + NGINX configured)

## Directory Structure

```
/var/www/
├── builtbybas/        # BuiltByBas portfolio site
├── colourparlor/      # The Colour Parlor salon site
├── figaro/            # Figaro Barbershop (this project)
├── html/              # Default NGINX page
└── umami/             # Umami analytics dashboard
```

## GitHub Multi-Account SSH (Local Machine Only)

The local development machine (`C:\Users\basro`) has SSH host aliases for pushing to multiple GitHub accounts. This setup is **not on the VPS** — the VPS clones via HTTPS.

### SSH Config (`~/.ssh/config` on local machine)

| Host Alias                   | GitHub Account  | SSH Key                         | Project                      |
| ---------------------------- | --------------- | ------------------------------- | ---------------------------- |
| `github.com-alwaysinallways` | AlwaysinAllways | `~/.ssh/github_alwaysinallways` | projectrestart               |
| `github.com-devbybas`        | devbybas-ai     | `~/.ssh/github_devbybas`        | figarobarbershop, builtbybas |
| `github.com-orcachild`       | OrcaChild       | `~/.ssh/github_orcachild`       | ocinw-website                |
| `github.com-powerofpraxis`   | PowerOfPraxis   | `~/.ssh/github_powerofpraxis`   | PraxisLibrary                |

### How it works

1. Standard remote: `git@github.com:devbybas-ai/repo.git`
2. Host alias remote: `git@github.com-devbybas:devbybas-ai/repo.git`
3. SSH reads `~/.ssh/config`, maps `github.com-devbybas` to `github.com` with the correct key
4. GitHub authenticates you as the correct account

### Setting a repo's remote

```bash
git remote set-url origin git@github.com-devbybas:devbybas-ai/repo-name.git
```

**Important:** The global `~/.gitconfig` has a credential helper pointing to GitHub CLI (`gh`), which is authenticated as `AlwaysinAllways`. This only affects HTTPS URLs. SSH host aliases bypass it entirely.

---

# Deployment Guide

## Deploying a New Next.js Site

### Prerequisites

- Code pushed to a GitHub repository
- Domain name ready (optional — can use direct IP initially)
- VPS access via SSH

### Step 1: Clone the Repository

```bash
cd /var/www
git clone https://github.com/ACCOUNT/REPO.git SITE_NAME
```

> Use HTTPS on the VPS. SSH host aliases are only configured on the local machine.

### Step 2: Install Dependencies

```bash
cd /var/www/SITE_NAME
pnpm install
```

If prompted to approve build scripts (Prisma, esbuild), press `a` to select all, then `Enter`, then `y` to confirm.

### Step 3: Create Environment File

```bash
cp .env.example .env
nano .env
```

Update at minimum:

- `DATABASE_URL` — point to localhost PostgreSQL with a dedicated user/database
- `NEXTAUTH_URL` — set to `http://72.62.200.30:PORT` (or domain when ready)
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `PORT` — the next available port (check the site map above)

### Step 4: Create a PostgreSQL Database

```bash
sudo -u postgres psql \
  -c "CREATE USER myapp_user WITH PASSWORD 'SecurePassword123';" \
  -c "CREATE DATABASE myapp OWNER myapp_user;" \
  -c "GRANT ALL PRIVILEGES ON DATABASE myapp TO myapp_user;"
```

### Step 5: Run Migrations and Seed

```bash
cd /var/www/SITE_NAME
pnpm exec prisma generate
pnpm exec prisma db push    # or: pnpm exec prisma migrate deploy
pnpm exec prisma db seed     # if seed script exists
```

### Step 6: Build the Application

```bash
pnpm build
```

Verify: zero errors, all routes listed.

### Step 7: Start with PM2

```bash
PORT=XXXX pm2 start pnpm --name "SITE_NAME" -- start
pm2 save
```

Verify: `pm2 list` shows the new process as `online`.

### Step 8: Verify Direct Access

Open firewall port (if accessing directly without NGINX):

```bash
ufw allow XXXX/tcp
```

Test in browser: `http://72.62.200.30:XXXX`

### Step 9: Configure NGINX (When Domain is Ready)

Create the site config:

```bash
nano /etc/nginx/sites-available/SITE_NAME
```

Template (based on existing sites):

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    access_log /var/log/nginx/SITE_NAME.access.log;
    error_log /var/log/nginx/SITE_NAME.error.log;

    location / {
        proxy_pass http://127.0.0.1:XXXX;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:XXXX;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    listen 80;
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/SITE_NAME /etc/nginx/sites-enabled/
nginx -t          # Test config — MUST pass before reloading
nginx -s reload   # Graceful reload — does NOT drop existing connections
```

**WARNING:** `nginx -t` is mandatory before reloading. A bad config will take down ALL sites.

### Step 10: SSL with Certbot

Ensure domain DNS is pointed to `72.62.200.30` and has propagated:

```bash
dig yourdomain.com +short    # Should return 72.62.200.30
```

Then run Certbot:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically modify the NGINX config to add SSL directives.

### Step 11: Close Direct Port Access

Once NGINX + SSL is handling traffic, remove the direct port from the firewall:

```bash
ufw delete allow XXXX/tcp
```

---

## Updating a Deployed Site

```bash
cd /var/www/SITE_NAME
git pull
pnpm install
pnpm build
pm2 restart SITE_NAME
```

If database schema changed:

```bash
pnpm exec prisma db push    # or: pnpm exec prisma migrate deploy
```

## Useful Commands

| Command                          | What it does                        |
| -------------------------------- | ----------------------------------- |
| `pm2 list`                       | Show all running apps               |
| `pm2 logs SITE_NAME`             | View app logs (live)                |
| `pm2 logs SITE_NAME --lines 100` | View last 100 log lines             |
| `pm2 restart SITE_NAME`          | Restart an app                      |
| `pm2 stop SITE_NAME`             | Stop an app                         |
| `pm2 delete SITE_NAME`           | Remove from PM2                     |
| `pm2 save`                       | Save process list (survives reboot) |
| `pm2 startup`                    | Generate startup script             |
| `nginx -t`                       | Test NGINX config                   |
| `nginx -s reload`                | Graceful reload                     |
| `ufw status`                     | Show firewall rules                 |
| `ss -tlnp`                       | Show all listening ports            |
| `certbot renew --dry-run`        | Test SSL renewal                    |
| `sudo -u postgres psql`          | Open PostgreSQL shell               |

## Troubleshooting

### App won't start

```bash
pm2 logs SITE_NAME --lines 50    # Check for errors
cat /var/www/SITE_NAME/.env      # Verify env vars
```

### Port already in use

```bash
ss -tlnp | grep XXXX             # Find what's using the port
```

### NGINX 502 Bad Gateway

The app isn't running or wrong port in NGINX config:

```bash
pm2 list                          # Is the app online?
ss -tlnp | grep XXXX             # Is it listening on the expected port?
cat /etc/nginx/sites-available/SITE_NAME | grep proxy_pass
```

### Database connection refused

```bash
ss -tlnp | grep 5432             # Is PostgreSQL running?
sudo -u postgres psql -l         # List databases
```

### SSL certificate not renewing

```bash
certbot renew --dry-run           # Test renewal
systemctl status certbot.timer    # Check auto-renewal timer
```
