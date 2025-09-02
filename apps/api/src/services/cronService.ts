import * as cron from 'node-cron';
import { databaseService } from './databaseService';
import { externalPaymentService } from './externalPaymentService';

export class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  startCronJobs(): void {
    // Process pending installments daily at 9 AM
    this.scheduleJob('process-installments', '0 9 * * *', () => {
      this.processPendingInstallments();
    });

    // Clean up old failed payments weekly on Sunday at 2 AM
    this.scheduleJob('cleanup-failed-payments', '0 2 * * 0', () => {
      this.cleanupFailedPayments();
    });

    console.log('✅ Cron jobs scheduled successfully');
  }

  private scheduleJob(name: string, schedule: string, task: () => void): void {
    const job = cron.schedule(schedule, task, {
      timezone: 'UTC'
    });

    this.jobs.set(name, job);
    job.start();
    
    console.log(`📅 Scheduled job '${name}' with schedule: ${schedule}`);
  }

  private async processPendingInstallments(): Promise<void> {
    try {
      console.log('🔄 Processing pending installments...');
      
      const pendingInstallments = await databaseService.getPendingInstallments();
      
      if (pendingInstallments.length === 0) {
        console.log('✅ No pending installments to process');
        return;
      }

      console.log(`📊 Found ${pendingInstallments.length} pending installments`);

      for (const installment of pendingInstallments) {
        await this.processInstallment(installment);
      }

      console.log('✅ Finished processing pending installments');
    } catch (error) {
      console.error('❌ Error processing pending installments:', error);
    }
  }

  private async processInstallment(installment: any): Promise<void> {
    try {
      console.log(`💳 Processing installment ${installment.installmentNumber} for payment ${installment.paymentId}`);

      // Get payment details to get customer info
      const payment = await databaseService.getPaymentById(installment.paymentId);
      if (!payment) {
        console.error(`❌ Payment not found: ${installment.paymentId}`);
        return;
      }

      // Update installment status to processing
      await databaseService.updateInstallmentStatus(installment.id, 'processing');

      // Process payment with external API
      const paymentResult = await externalPaymentService.processPayment({
        amount: installment.amount,
        customerInfo: {
          name: payment.customerName,
          email: payment.customerEmail,
          phone: payment.customerPhone
        },
        paymentId: installment.id
      });

      if (paymentResult.success) {
        // Update installment status to paid
        await databaseService.updateInstallmentStatus(
          installment.id, 
          'paid', 
          paymentResult.transactionId
        );
        
        console.log(`✅ Installment ${installment.installmentNumber} processed successfully`);
        
        // Check if this was the last installment
        const allInstallments = await databaseService.getInstallmentsByPaymentId(installment.paymentId);
        const paidInstallments = allInstallments.filter(i => i.status === 'paid');
        
        if (paidInstallments.length === allInstallments.length) {
          console.log(`🎉 All installments completed for payment ${installment.paymentId}`);
          // You could update the main payment status here if needed
        }
      } else {
        // Update installment status to failed
        await databaseService.updateInstallmentStatus(installment.id, 'failed');
        console.error(`❌ Installment ${installment.installmentNumber} failed: ${paymentResult.message}`);
      }
    } catch (error) {
      console.error(`❌ Error processing installment ${installment.id}:`, error);
      
      // Update installment status to failed
      try {
        await databaseService.updateInstallmentStatus(installment.id, 'failed');
      } catch (updateError) {
        console.error('❌ Failed to update installment status:', updateError);
      }
    }
  }

  private async cleanupFailedPayments(): Promise<void> {
    try {
      console.log('🧹 Cleaning up old failed payments...');
      
      // This is a placeholder for cleanup logic
      // In a real implementation, you might:
      // - Delete payments that have been failed for more than 30 days
      // - Archive old completed payments
      // - Clean up temporary data
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  stopCronJobs(): void {
    console.log('🛑 Stopping cron jobs...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    }
    
    this.jobs.clear();
  }

  getJobStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];
    
    for (const [name, job] of this.jobs) {
      status.push({
        name,
        running: job.getStatus() === 'scheduled'
      });
    }
    
    return status;
  }
}

export const cronService = new CronService();
