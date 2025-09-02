import { ExternalPaymentAPIResponse } from '../types';

interface PaymentRequest {
  amount: number;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  paymentId: string;
}

export class ExternalPaymentService {
  private apiUrl: string;
  private clientId: string;
  private apiPassword: string;

  constructor() {
    this.apiUrl = process.env.GREENPAY_API_URL || 'https://api.greenpay.com';
    this.clientId = process.env.GREENPAY_CLIENT_ID || '';
    this.apiPassword = process.env.GREENPAY_API_PASSWORD || '';
  }

  async processPayment(request: PaymentRequest): Promise<ExternalPaymentAPIResponse> {
    try {
      console.log('Processing one-time payment with GreenPay API:', {
        amount: request.amount,
        customerEmail: request.customerInfo.email,
        paymentId: request.paymentId
      });

      // For testing purposes, simulate GreenPay API response
      // In production, this would make actual API calls to GreenPay
      console.log('🔧 TESTING MODE: Simulating GreenPay one-time payment response');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Simulate successful payment response
      const mockResponse: ExternalPaymentAPIResponse = {
        success: true,
        transactionId: `gp_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: request.amount,
        status: 'success' as const,
        message: 'One-time payment processed successfully via GreenPay (TEST MODE)'
      };

      console.log('✅ GreenPay one-time payment response (TEST MODE):', mockResponse);
      return mockResponse;

    } catch (error) {
      console.error('GreenPay payment API error:', error);
      return {
        success: false,
        transactionId: '',
        amount: request.amount,
        status: 'failed',
        message: error instanceof Error ? error.message : 'GreenPay payment processing failed'
      };
    }
  }

  // Note: Refund functionality removed as only one-time payment API is needed for testing
}

export const externalPaymentService = new ExternalPaymentService();
