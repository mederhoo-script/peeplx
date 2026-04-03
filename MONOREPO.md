# PeeplX Monorepo Guide

This is a **monorepo** structure using **npm workspaces**. It contains multiple independent projects that share dependencies and root configuration.

## 📁 Workspace Structure

### Root Level
- `package.json` - Monorepo root with workspace definitions
- `.gitignore` - Git ignore rules for all workspaces
- `docker/` - Shared Docker configuration
- `docs/` - Shared documentation
- `database/` - Shared database schema

### Workspaces

#### 1. **Frontend** (`./frontend`)
- **Type**: React 19 + Vite SPA
- **Port**: 5173 (dev) / 3000 (production)
- **Purpose**: User-facing web application
- **Stack**: React 19, Vite 7.2, TypeScript 5.9, Tailwind CSS
- **Key Features**:
  - 50+ pre-built Radix UI components
  - GSAP animations for smooth UX
  - Form management with React Hook Form
  - Responsive design with Tailwind
  - Dark mode support

#### 2. **Backend** (`./backend`)
- **Type**: NestJS REST API
- **Port**: 3000 (dev) / 3000 (production)
- **Purpose**: Core business logic and data management
- **Stack**: NestJS 10, TypeScript, PostgreSQL, Redis
- **Key Services**:
  - Authentication (JWT)
  - User management
  - Escrow transactions
  - Trust score calculation
  - Payment processing (Paystack)
  - Dispute handling
  - Wallet management
  - Notifications

## 🔧 Monorepo Commands

All commands should be run from the **root directory** (`peeplx-platform/`).

### Installation

```bash
# Install all dependencies for all workspaces
npm install

# Install dependency for specific workspace
npm install -w backend package-name
npm install -w frontend package-name

# Install dev dependency for specific workspace
npm install -w frontend -D package-name
```

### Development

```bash
# Start all workspaces in watch mode
npm run dev

# Start specific workspace
npm run dev:backend
npm run dev:frontend

# Watch backend only
npm run dev:backend

# Watch frontend only
npm run dev:frontend
```

### Building

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build:backend
npm run build:frontend
```

### Linting & Quality

```bash
# Lint all workspaces
npm run lint

# Test all workspaces
npm run test
```

### Database

```bash
# Start database services
cd docker && docker-compose up -d

# Stop database services
cd docker && docker-compose down

# View database logs
cd docker && docker-compose logs postgres
```

## 📦 Department Dependencies

### Frontend Dependencies
- `react` - UI library
- `vite` - Build tool
- `typescript` - Type safety
- `react-hook-form` - Form management
- `zod` - Schema validation
- `@radix-ui/*` - Accessible components
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `gsap` - Animations
- `recharts` - Charts

### Backend Dependencies
- `@nestjs/*` - Framework
- `typeorm` - ORM
- `@nestjs/jwt` - JWT auth
- `passport` - Authentication
- `bcrypt` - Password hashing
- `paystack` - Payment processing
- `redis` - Caching
- `pg` - PostgreSQL driver

## 🔄 Workspace Workflow

### Adding a New Dependency

**Frontend:**
```bash
npm install -w frontend package-name
```

**Backend:**
```bash
npm install -w backend package-name
```

### Running Scripts

Each workspace has its own `package.json` with custom scripts:

**Frontend `package.json` scripts:**
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

**Backend `package.json` scripts:**
```json
{
  "dev": "nest start --watch",
  "build": "nest build",
  "start": "node dist/main",
  "test": "jest"
}
```

## 🐳 Docker Services

When you run `docker-compose up`, the following services start:

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching & sessions |
| Elasticsearch | 9200 | Full-text search |

## 📝 Environment Variables

### Frontend `.env`
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=PeeplX
```

### Backend `.env`
```
NODE_ENV=development
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=peeplx
DB_PASSWORD=peeplx_password
DB_NAME=peeplx_db

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_secret_key

PAYSTACK_SECRET_KEY=your_paystack_key
```

## 🔍 Monorepo Best Practices

1. **Workspace Independence** - Each workspace should be independently runnable
2. **Shared Dependencies** - Common dependencies are installed at root level
3. **Cross-workspace References** - Keep minimal; use APIs instead
4. **Version Management** - Keep versions synchronized at root
5. **Build Order** - Backend typically builds before frontend in CI/CD

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build both workspaces
npm run build

# Start backend (from backend directory)
cd backend && npm run start

# Start frontend (from frontend directory)
cd frontend && npm run start
```

### Docker Production
```bash
cd docker
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 📚 Additional Resources

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Project Roadmap](./docs/ROADMAP.md)

---

**Last Updated**: March 2026
