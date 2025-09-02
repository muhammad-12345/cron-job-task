export interface PaymentRequest {
  amount: number;
  paymentType: 'full' | 'installment';
  downPayment?: number;
  installmentCount?: 3 | 6 | 12;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  message: string;
  transactionDetails?: {
    amount: number;
    installmentCount?: number;
    nextPaymentDate?: string;
  };
}

export interface InstallmentPlan {
  id: string;
  paymentId: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'failed' | 'processing';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  paymentType: 'full' | 'installment';
  downPayment?: number;
  installmentCount?: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ExternalPaymentAPIResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  message?: string;
}

export interface CronJobConfig {
  name: string;
  schedule: string;
  enabled: boolean;
}
