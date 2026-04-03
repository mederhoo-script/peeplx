# PeeplX Deployment Guide

Complete step-by-step guide to deploy PeeplX escrow platform to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [AWS Production Deployment](#aws-production-deployment)
5. [SSL Configuration](#ssl-configuration)
6. [Domain Setup](#domain-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Docker | 24+ | Containerization |
| Docker Compose | 2+ | Multi-container orchestration |
| PostgreSQL | 15+ | Primary database |
| Redis | 7+ | Caching & sessions |

### Required Accounts

- [Paystack](https://dashboard.paystack.com) - Payment processing
- [AWS](https://aws.amazon.com) - Cloud hosting (optional)
- Domain registrar - For custom domain

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/peeplx/peeplx-platform.git
cd peeplx-platform
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Generate secure secrets
openssl rand -base64 64  # JWT_ACCESS_SECRET
openssl rand -base64 64  # JWT_REFRESH_SECRET
openssl rand -base64 32  # ENCRYPTION_KEY

# Edit .env file
nano .env
```

**Required Environment Variables:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=peeplx
DB_PASSWORD=your_secure_password
DB_NAME=peeplx_db

# JWT Secrets
JWT_ACCESS_SECRET=your_generated_secret
JWT_REFRESH_SECRET=your_generated_secret

# Paystack
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Database Setup

```bash
# Start PostgreSQL
sudo service postgresql start

# Create database
sudo -u postgres psql -c "CREATE DATABASE peeplx_db;"
sudo -u postgres psql -c "CREATE USER peeplx WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE peeplx_db TO peeplx;"

# Run schema
psql -U peeplx -d peeplx_db -f database/schema.sql
```

### 4. Start Services

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - Redis
redis-server
```

### 5. Verify Installation

- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- Frontend: http://localhost:3001

---

## Docker Deployment

### 1. Quick Start with Docker Compose

```bash
cd docker

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 2. Services Overview

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| elasticsearch | 9200 | Search engine |
| backend | 3000 | NestJS API |
| frontend | 3001 | Next.js app |
| nginx | 80/443 | Reverse proxy |

### 3. Docker Commands

```bash
# Rebuild services
docker-compose up -d --build

# Scale backend
docker-compose up -d --scale backend=3

# View specific service logs
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend sh

# Backup database
docker-compose exec postgres pg_dump -U peeplx peeplx_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U peeplx peeplx_db < backup.sql
```

---

## AWS Production Deployment

### 1. EC2 Instance Setup

```bash
# Launch EC2 instance
# - Instance type: t3.medium (2 vCPU, 4GB RAM)
# - OS: Ubuntu 22.04 LTS
# - Storage: 50GB SSD
# - Security Group: 22, 80, 443, 3000, 3001

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 2. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for build)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install other tools
sudo apt install -y git nginx certbot python3-certbot-nginx
```

### 3. Application Deployment

```bash
# Clone repository
git clone https://github.com/peeplx/peeplx-platform.git
cd peeplx-platform

# Create production environment
cp .env.example .env.production
nano .env.production

# Set production values
NODE_ENV=production
APP_URL=https://api.peeplx.com
FRONTEND_URL=https://peeplx.com
DB_HOST=postgres
REDIS_HOST=redis
```

### 4. Docker Compose Production

Create `docker/docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    restart: always

  frontend:
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: always

  postgres:
    volumes:
      - /var/lib/peeplx/postgres:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
    restart: always

  redis:
    volumes:
      - /var/lib/peeplx/redis:/data
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
    restart: always
```

### 5. Start Production Services

```bash
cd docker

# Start with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify all services are running
docker-compose ps
```

---

## SSL Configuration

### 1. Let's Encrypt SSL

```bash
# Obtain certificate
sudo certbot --nginx -d peeplx.com -d www.peeplx.com -d api.peeplx.com

# Auto-renewal test
sudo certbot renew --dry-run

# Setup auto-renewal cron
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx Configuration

Create `/etc/nginx/sites-available/peeplx`:

```nginx
# Frontend
server {
    listen 80;
    server_name peeplx.com www.peeplx.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name peeplx.com www.peeplx.com;

    ssl_certificate /etc/letsencrypt/live/peeplx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/peeplx.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.peeplx.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.peeplx.com;

    ssl_certificate /etc/letsencrypt/live/peeplx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/peeplx.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable configuration:

```bash
sudo ln -s /etc/nginx/sites-available/peeplx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Domain Setup

### 1. DNS Configuration

Add these records to your DNS provider:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_EC2_IP | 300 |
| A | www | YOUR_EC2_IP | 300 |
| A | api | YOUR_EC2_IP | 300 |

### 2. Verify DNS

```bash
# Check DNS propagation
dig peeplx.com
dig api.peeplx.com

# Test SSL
openssl s_client -connect peeplx.com:443
```

---

## Monitoring & Maintenance

### 1. Health Checks

```bash
# Backend health
curl https://api.peeplx.com/api/v1/health

# Database health
docker-compose exec postgres pg_isready -U peeplx

# Redis health
docker-compose exec redis redis-cli ping
```

### 2. Log Monitoring

```bash
# View all logs
docker-compose logs -f --tail=100

# View error logs
docker-compose logs -f backend | grep ERROR

# Export logs
docker-compose logs backend > backend.log
```

### 3. Database Backups

```bash
# Create backup script
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/var/backups/peeplx
mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U peeplx peeplx_db | gzip > $BACKUP_DIR/peeplx_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x /opt/backup.sh

# Add to cron (daily at 2 AM)
0 2 * * * /opt/backup.sh
```

### 4. SSL Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check certificate expiry
echo | openssl s_client -servername peeplx.com -connect peeplx.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U peeplx

# View PostgreSQL logs
docker-compose logs postgres

# Reset database (WARNING: Destroys data)
docker-compose down -v
docker-compose up -d postgres
```

#### 2. Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild backend
docker-compose up -d --build backend

# Check environment variables
docker-compose exec backend env
```

#### 3. SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate
sudo certbot certificates

# Reinstall certificate
sudo certbot install --nginx -d peeplx.com
```

#### 4. High Memory Usage

```bash
# Check memory usage
docker stats

# Restart services
docker-compose restart backend

# Scale down if needed
docker-compose up -d --scale backend=1
```

### Debug Commands

```bash
# Enter container shell
docker-compose exec backend sh

# Check network
docker network ls
docker network inspect docker_peeplx-network

# View container details
docker inspect docker_backend_1

# Resource usage
docker system df
docker system prune -a  # Clean up unused data
```

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Nginx reverse proxy configured
- [ ] Firewall rules set (ports 80, 443)
- [ ] Backup scripts configured
- [ ] Monitoring alerts set up
- [ ] Log rotation configured
- [ ] SSL auto-renewal tested
- [ ] Paystack webhooks configured
- [ ] Email service tested
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Error tracking integrated

---

## Support

For deployment support:
- 📧 Email: devops@peeplx.com
- 📖 Docs: https://docs.peeplx.com/deployment
- 💬 Discord: https://discord.gg/peeplx
