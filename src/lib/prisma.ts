import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase uses Supavisor (pgBouncer-compatible) connection pooling.
// In serverless environments each cold-start creates a new connection,
// so we cap pool size to 1 and rely on the pooler.
// The DATABASE_URL must include ?pgbouncer=true&connection_limit=1
// DIRECT_URL is used only by Prisma CLI (migrate / db push).
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
