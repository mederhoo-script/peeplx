import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  // Application
  name: process.env.APP_NAME || 'PeeplX',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  url: process.env.APP_URL || 'http://localhost:3000',
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
  logToFile: process.env.LOG_TO_FILE === 'true',
  
  // Email
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@peeplx.com',
    fromName: process.env.SMTP_FROM_NAME || 'PeeplX',
  },
  
  // File upload
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 10485760, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    storagePath: process.env.UPLOAD_PATH || './uploads',
  },
  
  // Escrow settings
  escrow: {
    expiryHours: parseInt(process.env.ESCROW_EXPIRY_HOURS, 10) || 72,
    autoCancelHours: parseInt(process.env.ESCROW_AUTO_CANCEL_HOURS, 10) || 168,
    feePercentage: parseFloat(process.env.ESCROW_FEE_PERCENTAGE) || 2.5,
    minFee: parseInt(process.env.ESCROW_MIN_FEE, 10) || 500, // ₦5 in kobo
    maxFee: parseInt(process.env.ESCROW_MAX_FEE, 10) || 500000, // ₦5,000 in kobo
  },
  
  // Trust score settings
  trustScore: {
    minTransactionsForScore: parseInt(process.env.TRUST_MIN_TRANSACTIONS, 10) || 3,
    scoreDecayDays: parseInt(process.env.TRUST_SCORE_DECAY_DAYS, 10) || 90,
    disputePenalty: parseInt(process.env.TRUST_DISPUTE_PENALTY, 10) || 10,
  },
  
  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
}));
