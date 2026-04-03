# 🛡️ PeeplX - Africa's Secure Escrow Infrastructure

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple.svg)](https://vitejs.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com/)

**PeeplX** is a production-ready fintech escrow platform designed to make online transactions between strangers safe across Africa. Built with modern technologies and enterprise-grade security.

This is a **monorepo** containing:
- 🎨 **Frontend**: React 19 + Vite with 50+ UI components
- 🔧 **Backend**: NestJS with microservices architecture
- 🗄️ **Database**: PostgreSQL with complete schema
- 🐳 **Infrastructure**: Docker & Docker Compose for local dev and production

## 🚀 Key Features

### Core Escrow System
- ✅ **Secure Escrow Transactions** - Funds held safely until delivery confirmation
- ✅ **Multi-Party Workflow** - Buyer, seller, and admin roles
- ✅ **Transaction Tracking** - Real-time status updates
- ✅ **Auto-Cancellation** - Expired transactions handled automatically

### Portable Trust Score™
- 🏆 **Dynamic Reputation System** - Score 0-100 based on transaction history
- 🏆 **Public Trader Profiles** - Shareable reputation at `peeplx.com/trader/:username`
- 🏆 **Trust Badges** - Visual indicators of trader reliability
- 🏆 **Cross-Markplace Verification** - Use your PeeplX reputation anywhere

### Security & Compliance
- 🔐 **BVN/NIN Identity Verification** - Nigerian identity verification
- 🔐 **JWT Authentication** - Secure token-based auth
- 🔐 **Rate Limiting** - API protection against abuse
- 🔐 **Fraud Detection** - Automated suspicious activity monitoring
- 🔐 **End-to-End Encryption** - Sensitive data protection

### Payment Integration
- 💳 **Paystack Integration** - Nigerian payment processing
- 💳 **Wallet System** - Internal balance management
- 💳 **Bank Transfers** - Withdrawal to Nigerian banks
- 💳 **Webhook Verification** - Secure payment callbacks

## 📂 Project Structure

This monorepo is organized as follows:

```
peeplx-platform/
├── frontend/                    # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/         # 50+ UI components (Radix UI + custom)
│   │   ├── sections/           # Page sections
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # Entry point
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── package.json
│
├── backend/                     # NestJS Backend API
│   ├── src/
│   │   ├── auth/               # JWT authentication, registration
│   │   ├── users/              # User management
│   │   ├── escrow/             # Escrow transaction workflow
│   │   ├── trust-score/        # Portable Trust Score calculation
│   │   ├── payments/           # Paystack integration
│   │   ├── disputes/           # Dispute resolution
│   │   ├── wallet/             # Wallet management
│   │   ├── notifications/      # Notifications service
│   │   ├── config/             # Configuration modules
│   │   ├── common/             # Shared utilities & middleware
│   │   ├── app.module.ts       # Root module
│   │   └── main.ts             # Bootstrap file
│   └── package.json
│
├── database/                    # Database
│   └── schema.sql              # PostgreSQL complete schema
│
├── docker/                      # Container Configuration
│   ├── docker-compose.yml      # Multi-service orchestration
│   ├── Dockerfile.backend      # Backend container
│   └── Dockerfile.frontend     # Frontend container
│
├── docs/                        # Documentation
│   ├── DEPLOYMENT.md           # Production deployment guide
│   ├── ROADMAP.md              # 12-month roadmap
│   └── GROWTH_STRATEGY.md      # User acquisition strategy
│
├── package.json                 # Monorepo root with workspaces
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🏗️ Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────┐
│                        PEEPLX PLATFORM                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Frontend   │  │   Backend    │  │   Database   │      │
│  │(React 19 V)  │  │  (NestJS)    │  │ (PostgreSQL) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│              ┌────────────┴────────────┐                   │
│              │    Docker Compose       │                   │
│              │   (Orchestration)       │                   │
│              └─────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 7.2, TypeScript 5.9, TailwindCSS 3.4 |
| **UI Components** | Radix UI (50+ components), GSAP animations |
| **Forms & Validation** | React Hook Form, Zod |
| **State Management** | React context + custom hooks |
| **Backend** | NestJS 10, Express, Node.js 18+ |
| **Database** | PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Search** | Elasticsearch 8 |
| **Payments** | Paystack API |
| **Notifications** | Sonner (toasts), Email |
| **Container** | Docker, Docker Compose |
| **Auth** | JWT, bcrypt, passport.js |
| **Testing** | Jest, Supertest |
| **Build Tools** | Vite, esbuild, tsc |

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+
- **Docker** & **Docker Compose** (for database services)
- **Git**

### Option 1: Development Mode (Recommended for Developers)

```bash
# Clone the repository
git clone https://github.com/peeplx/peeplx-platform.git
cd peeplx-platform

# Install all dependencies (both frontend and backend)
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL, Redis, and Elasticsearch with Docker
cd docker
docker-compose up -d
cd ..

# Start both frontend and backend in watch mode
npm run dev

# OR start them separately
npm run dev:frontend    # Runs at http://localhost:5173
npm run dev:backend     # Runs at http://localhost:3000
```

### Option 2: Docker Compose (Full Stack)

```bash
# Start all services including frontend and backend
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 3: Production Build

```bash
# Build both frontend and backend
npm run build

# Build specific workspaces
npm run build:frontend
npm run build:backend
```

## 📦 Workspace Commands

Since this is an npm monorepo, you can run commands on specific workspaces:

```bash
# Install dependencies for all workspaces
npm install

# Run development server in all workspaces
npm run dev

# Run development server for specific workspace
npm run dev:backend
npm run dev:frontend

# Build all workspaces
npm run build

# Build specific workspace
npm run build:backend
npm run build:frontend

# Lint all workspaces
npm run lint

# Clean build artifacts
npm run clean
```

## 📋 Environment Configuration

### Backend (.env)

Key variables:
```env
NODE_ENV=development
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=peeplx
DB_PASSWORD=your_password
DB_NAME=peeplx_db

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=your_secret_key_here
JWT_REFRESH_SECRET=your_secret_key_here

PAYSTACK_SECRET_KEY=your_paystack_key
```

See [.env.example](.env.example) for complete configuration.

# Stop services
docker-compose down
```

### 3. Local Development

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev

# API will be available at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# App will be available at http://localhost:3001
```

## 📊 Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts and profiles |
| `wallets` | User wallet balances |
| `escrow_transactions` | Escrow transaction records |
| `trust_scores` | Portable trust scores |
| `disputes` | Dispute cases |
| `reviews` | User reviews and ratings |
| `notifications` | User notifications |

### Trust Score Calculation

The Portable Trust Score is calculated using weighted factors:

```
Overall Score = (
  Transaction Score × 25% +
  Value Score × 20% +
  Dispute Score × 20% +
  Verification Score × 15% +
  Longevity Score × 10% +
  Review Score × 10%
)
```

**Score Levels:**
- 🌱 **0-30**: New Trader
- ✅ **30-60**: Verified Trader  
- 🌟 **60-85**: Trusted Trader
- 👑 **85-100**: Elite Trader

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting per endpoint
- Account lockout after failed attempts
- Two-factor authentication support

### Data Protection
- AES-256 encryption for sensitive data
- BVN/NIN verification integration
- SQL injection prevention (TypeORM)
- XSS protection headers
- CSRF token validation

### Fraud Detection
- Velocity checking on transactions
- Suspicious activity monitoring
- Automated risk scoring
- Manual review queue for flagged accounts

## 💳 Payment Integration

### Paystack Setup

1. Create account at [Paystack](https://paystack.com)
2. Get your API keys from the dashboard
3. Configure webhook URL: `https://your-domain.com/api/v1/payments/webhook`
4. Add keys to `.env` file

### Supported Payment Methods
- 💳 Card payments
- 🏦 Bank transfers
- 📱 USSD
- 💰 Bank account (withdrawals)

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Escrow Endpoints

```http
POST   /api/v1/escrow              # Create escrow
GET    /api/v1/escrow              # List user escrows
GET    /api/v1/escrow/:id          # Get escrow details
POST   /api/v1/escrow/:id/fund     # Fund escrow
POST   /api/v1/escrow/:id/deliver  # Confirm delivery
POST   /api/v1/escrow/:id/complete # Confirm receipt
POST   /api/v1/escrow/:id/cancel   # Cancel escrow
```

### Trust Score Endpoints

```http
GET /api/v1/trust-score/me              # My trust score
GET /api/v1/trust-score/:username       # Public profile
GET /api/v1/trust-score/leaderboard     # Top traders
```

Full API documentation available at `/api/docs` when running the backend.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:e2e

# Frontend tests
cd frontend
npm run test
```

## 🚢 Production Deployment

### AWS Deployment

1. **EC2 Setup**
   ```bash
   # Launch EC2 instance (t3.medium recommended)
   # Security group: 22, 80, 443, 3000, 3001
   ```

2. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo usermod -aG docker $USER
   ```

3. **Deploy**
   ```bash
   git clone https://github.com/peeplx/peeplx-platform.git
   cd peeplx-platform
   cp .env.example .env
   # Edit .env with production values
   cd docker
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### SSL Configuration (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d peeplx.com -d www.peeplx.com

# Auto-renewal
sudo certbot renew --dry-run
```

## 📈 Monitoring & Logging

### Health Checks
- Backend: `GET /api/v1/health`
- Database: Automatic connection pooling
- Redis: Built-in health monitoring

### Logging
- Winston logger with daily rotation
- Separate error and access logs
- Structured JSON logging for production

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- ESLint + Prettier for code formatting
- Conventional commit messages
- Unit tests for new features
- API documentation updates

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🆘 Support

- 📧 Email: support@peeplx.com
- 💬 Discord: [Join our community](https://discord.gg/peeplx)
- 📖 Docs: [docs.peeplx.com](https://docs.peeplx.com)

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [Paystack](https://paystack.com/) - Payment processing
- [TailwindCSS](https://tailwindcss.com/) - Styling

---

Built with ❤️ in Lagos, Nigeria 🇳🇬

**PeeplX** - Building Trust in Digital Commerce
