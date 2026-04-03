/**
 * Edge Runtime-compatible JWT helpers.
 *
 * Next.js middleware runs in the Edge Runtime (V8 isolates) which does NOT
 * support Node.js crypto APIs. The `jsonwebtoken` package used in auth.ts
 * relies on those APIs and therefore cannot be imported from middleware.
 *
 * This module re-implements token verification using `jose`, which is built
 * on the Web Crypto API and works in both Edge and Node.js runtimes.
 *
 * API routes (Node.js runtime) continue to use auth.ts / jsonwebtoken for
 * signing because jsonwebtoken's sign output is standard HS256 JWTs that
 * jose can verify without any changes.
 */

import { jwtVerify } from 'jose'
import type { TokenPayload } from './auth'

const encoder = new TextEncoder()

function getSecret(raw: string): Uint8Array {
  return encoder.encode(raw)
}

const JWT_SECRET_RAW =
  process.env.JWT_SECRET || 'peeplx-secret-key-change-in-production'

/**
 * Verify an access token in the Edge Runtime.
 * Accepts tokens signed by the Node.js `jsonwebtoken`-based signToken().
 */
export async function verifyTokenEdge(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(JWT_SECRET_RAW))

  const userId = payload['userId']
  const email = payload['email']
  const role = payload['role']

  if (typeof userId !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
    throw new Error('Invalid token payload: missing required fields')
  }

  return { userId, email, role }
}
