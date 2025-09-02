import { v4 as uuidv4 } from 'uuid';
import { PaymentRequest, PaymentResponse, PaymentRecord, InstallmentPlan } from '../types';
import { databaseService } from './databaseService';
import { externalPaymentService } from './externalPaymentService';

export class PaymentService {
  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentId = uuidv4();
      
      if (paymentRequest.paymentType === 'full') {
        return await this.processFullPayment(paymentId, paymentRequest);
      } else {
        return await this.processInstallmentPayment(paymentId, paymentRequest);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new Error('Failed to process payment');
    }
  }

  private async processFullPayment(paymentId: string, request: PaymentRequest): Promise<PaymentResponse> {
    // Create payment record
    const paymentRecord: Omit<PaymentRecord, 'createdAt' | 'updatedAt'> = {
      id: paymentId,
      customerName: request.customerInfo.name,
      customerEmail: request.customerInfo.email,
      customerPhone: request.customerInfo.phone,
      totalAmount: request.amount,
      paymentType: 'full',
      status: 'pending'
    };

    await databaseService.createPayment(paymentRecord);

    // Process payment with external API
    const paymentResult = await externalPaymentService.processPayment({
      amount: request.amount,
      customerInfo: request.customerInfo,
      paymentId
    });

    if (paymentResult.success) {
      // Update payment status to completed
      // Note: In a real implementation, you'd update the database here
      return {
        success: true,
        paymentId,
        message: 'Payment processed successfully',
        transactionDetails: {
          amount: request.amount
        }
      };
    } else {
      throw new Error(paymentResult.message || 'Payment failed');
    }
  }

  private async processInstallmentPayment(paymentId: string, request: PaymentRequest): Promise<PaymentResponse> {
    if (!request.installmentCount) {
      throw new Error('Installment count is required for installment payments');
    }

    const downPayment = request.downPayment || 0;
    const remainingAmount = request.amount - downPayment;
    const baseAmount = Math.floor(remainingAmount / request.installmentCount);
    const remainder = remainingAmount % request.installmentCount;

    // Create payment record
    const paymentRecord: Omit<PaymentRecord, 'createdAt' | 'updatedAt'> = {
      id: paymentId,
      customerName: request.customerInfo.name,
      customerEmail: request.customerInfo.email,
      customerPhone: request.customerInfo.phone,
      totalAmount: request.amount,
      paymentType: 'installment',
      downPayment,
      installmentCount: request.installmentCount,
      status: 'pending'
    };

    await databaseService.createPayment(paymentRecord);

    // Create installment records
    const installments: Omit<InstallmentPlan, 'createdAt' | 'updatedAt'>[] = [];
    
    for (let i = 1; i <= request.installmentCount; i++) {
      const installmentId = uuidv4();
      const dueDate = this.calculateDueDate(i, downPayment > 0);
      
      // Calculate amount for this installment
      let amount: number;
      if (i === 1 && downPayment > 0) {
        amount = downPayment;
      } else {
        // Add 1 to the first 'remainder' installments to distribute the extra amount
        const installmentIndex = i - (downPayment > 0 ? 1 : 0); // Adjust index if there's a down payment
        amount = baseAmount + (installmentIndex <= remainder ? 1 : 0);
      }
      
      installments.push({
        id: installmentId,
        paymentId,
        installmentNumber: i,
        amount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }

    // Save installments to database
    for (const installment of installments) {
      await databaseService.createInstallment(installment);
    }

    // Process first installment immediately
    const firstInstallment = installments[0];
    const paymentResult = await externalPaymentService.processPayment({
      amount: firstInstallment.amount,
      customerInfo: request.customerInfo,
      paymentId: firstInstallment.id
    });

    if (paymentResult.success) {
      // Update first installment status
      await databaseService.updateInstallmentStatus(
        firstInstallment.id, 
        'paid', 
        paymentResult.transactionId
      );

      const nextPaymentDate = installments.length > 1 ? installments[1].dueDate : undefined;

      return {
        success: true,
        paymentId,
        message: 'Installment payment setup successful. First installment processed.',
        transactionDetails: {
          amount: firstInstallment.amount,
          installmentCount: request.installmentCount,
          nextPaymentDate
        }
      };
    } else {
      throw new Error(paymentResult.message || 'First installment payment failed');
    }
  }

  private calculateDueDate(installmentNumber: number, hasDownPayment: boolean): Date {
    const now = new Date();
    
    // If there's a down payment, the first installment is immediate
    // Subsequent installments start from next month
    if (hasDownPayment && installmentNumber === 1) {
      return now;
    }
    
    // Calculate months to add
    const monthsToAdd = hasDownPayment ? installmentNumber - 1 : installmentNumber;
    
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + monthsToAdd);
    
    return dueDate;
  }

  async getPaymentDetails(paymentId: string): Promise<PaymentRecord | null> {
    return await databaseService.getPaymentById(paymentId);
  }

  async getInstallmentDetails(paymentId: string): Promise<InstallmentPlan[]> {
    return await databaseService.getInstallmentsByPaymentId(paymentId);
  }
}

export const paymentService = new PaymentService();
