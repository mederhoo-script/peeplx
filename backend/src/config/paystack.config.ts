import { registerAs } from '@nestjs/config';

export const paystackConfig = registerAs('paystack', () => ({
  // API Keys
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  
  // API Endpoints
  baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
  
  // Webhook
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
  webhookUrl: process.env.PAYSTACK_WEBHOOK_URL,
  
  // Transaction settings
  currency: process.env.PAYSTACK_CURRENCY || 'NGN',
  
  // Fee settings (in percentage)
  feePercentage: parseFloat(process.env.PAYSTACK_FEE_PERCENTAGE) || 1.5,
  feeCap: parseInt(process.env.PAYSTACK_FEE_CAP, 10) || 200000, // ₦2,000 in kobo
  
  // Transfer settings
  transferFee: parseInt(process.env.PAYSTACK_TRANSFER_FEE, 10) || 1000, // ₦10 in kobo
  
  // Retry settings
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  
  // Timeout
  timeout: 30000, // 30 seconds
}));
