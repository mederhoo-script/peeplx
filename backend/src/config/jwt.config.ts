import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  // Secret keys
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  
  // Token expiration
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Issuer and audience
  issuer: process.env.JWT_ISSUER || 'peeplx.com',
  audience: process.env.JWT_AUDIENCE || 'peeplx-api',
  
  // Algorithm
  algorithm: 'HS256',
  
  // Refresh token settings
  refreshTokenRotation: true,
  refreshTokenReuseDetection: true,
}));
