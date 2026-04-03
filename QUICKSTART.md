# PeeplX Quick Start Guide

Get PeeplX running in 5 minutes!

## Prerequisites

- Docker & Docker Compose
- Git
- 4GB RAM available

## Step 1: Clone & Configure

```bash
# Clone the repository
git clone https://github.com/peeplx/peeplx-platform.git
cd peeplx-platform

# Copy environment file
cp .env.example .env

# Generate secrets (optional for local dev)
# The defaults will work for local testing
```

## Step 2: Start with Docker

```bash
cd docker

# Start all services
docker-compose up -d

# Wait 30 seconds for services to initialize
sleep 30

# Check status
docker-compose ps
```

## Step 3: Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | Main application |
| API | http://localhost:3000 | Backend API |
| API Docs | http://localhost:3000/api/docs | Swagger documentation |
| Database | localhost:5432 | PostgreSQL |
| Redis | localhost:6379 | Cache |

## Step 4: Create First User

```bash
# Register via API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Step 5: Create First Escrow

```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.accessToken')

# Create escrow
curl -X POST http://localhost:3000/api/v1/escrow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "buyerId": "user-uuid-1",
    "sellerId": "user-uuid-2",
    "title": "iPhone 14 Pro",
    "description": "Brand new iPhone",
    "amount": 500000,
    "type": "product"
  }'
```

## Common Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Reset database (WARNING: Destroys data)
docker-compose down -v
docker-compose up -d

# Access database
docker-compose exec postgres psql -U peeplx -d peeplx_db

# Access backend shell
docker-compose exec backend sh
```

## Development Mode

### Backend Only

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Only

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Key variables to customize in `.env`:

```env
# Required for payments
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key

# Required for emails
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# JWT secrets (generate with: openssl rand -base64 64)
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U peeplx

# View PostgreSQL logs
docker-compose logs postgres
```

### Services Not Starting

```bash
# Check Docker status
docker ps

# Rebuild containers
docker-compose up -d --build
```

## Next Steps

1. **Read the docs:**
   - [README.md](README.md) - Project overview
   - [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment
   - [ROADMAP.md](docs/ROADMAP.md) - Development roadmap

2. **Explore the API:**
   - Visit http://localhost:3000/api/docs
   - Try the interactive Swagger UI

3. **Customize:**
   - Modify `.env` for your setup
   - Update branding in frontend
   - Add your Paystack keys

## Support

- 📧 Email: support@peeplx.com
- 📖 Docs: https://docs.peeplx.com
- 💬 Discord: https://discord.gg/peeplx

---

**You're all set!** Start building with PeeplX 🚀
