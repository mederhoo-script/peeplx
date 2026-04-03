import axios from 'axios'

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://api.monnify.com'
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY || ''
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY || ''
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE || ''

interface MonnifyAuthResponse {
  requestSuccessful: boolean
  responseMessage: string
  responseBody: {
    accessToken: string
    expiresIn: number
  }
}

interface InitializePaymentParams {
  amount: number
  customerName: string
  customerEmail: string
  paymentReference: string
  paymentDescription: string
  redirectUrl?: string
  metadata?: Record<string, any>
}

interface InitializePaymentResponse {
  requestSuccessful: boolean
  responseMessage: string
  responseBody: {
    transactionReference: string
    paymentReference: string
    merchantName: string
    apiKey: string
    enabledPaymentMethod: string[]
    checkoutUrl: string
  }
}

interface VerifyPaymentResponse {
  requestSuccessful: boolean
  responseMessage: string
  responseBody: {
    transactionReference: string
    paymentReference: string
    amountPaid: string
    totalPayable: string
    settlementAmount: string
    paidOn: string
    paymentStatus: string
    paymentDescription: string
    currency: string
    paymentMethod: string
    product: {
      type: string
      reference: string
    }
    cardDetails?: {
      cardNumber: string
      cardType: string
      bank: string
    }
    accountDetails?: {
      accountName: string
      accountNumber: string
      bankCode: string
      amountPaid: string
    }
    accountPayments?: Array<{
      accountNumber: string
      bankCode: string
      accountName: string
      amountPaid: string
      paidOn: string
    }>
    customer: {
      email: string
      name: string
    }
  }
}

class MonnifyClient {
  private accessToken: string | null = null
  private tokenExpiresAt: number = 0

  private async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken
    }

    try {
      const credentials = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString('base64')
      
      const response = await axios.post<MonnifyAuthResponse>(
        `${MONNIFY_BASE_URL}/api/v1/auth/login`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data.requestSuccessful) {
        this.accessToken = response.data.responseBody.accessToken
        // Set expiration to 5 minutes before actual expiry for safety
        this.tokenExpiresAt = Date.now() + (response.data.responseBody.expiresIn - 300) * 1000
        return this.accessToken
      } else {
        throw new Error(response.data.responseMessage || 'Authentication failed')
      }
    } catch (error) {
      console.error('Monnify authentication error:', error)
      throw new Error('Failed to authenticate with Monnify')
    }
  }

  async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResponse> {
    try {
      const token = await this.authenticate()

      const payload = {
        amount: params.amount,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        paymentReference: params.paymentReference,
        paymentDescription: params.paymentDescription,
        currencyCode: 'NGN',
        contractCode: MONNIFY_CONTRACT_CODE,
        redirectUrl: params.redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
        metadata: params.metadata,
      }

      const response = await axios.post<InitializePaymentResponse>(
        `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Monnify initialize payment error:', error.response?.data || error)
      throw new Error(error.response?.data?.responseMessage || 'Failed to initialize payment')
    }
  }

  async verifyPayment(transactionReference: string): Promise<VerifyPaymentResponse> {
    try {
      const token = await this.authenticate()

      const response = await axios.get<VerifyPaymentResponse>(
        `${MONNIFY_BASE_URL}/api/v2/transactions/${encodeURIComponent(transactionReference)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Monnify verify payment error:', error.response?.data || error)
      throw new Error(error.response?.data?.responseMessage || 'Failed to verify payment')
    }
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha512', process.env.MONNIFY_WEBHOOK_SECRET || '')
      .update(payload)
      .digest('hex')

    return hash === signature
  }
}

export const monnifyClient = new MonnifyClient()

export type {
  InitializePaymentParams,
  InitializePaymentResponse,
  VerifyPaymentResponse,
}
