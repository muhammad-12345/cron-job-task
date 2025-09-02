import * as cron from 'node-cron';
import { databaseService } from './databaseService';
import { externalPaymentService } from './externalPaymentService';

export class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  startCronJobs(): void {
    console.log('🔄 Starting cron jobs...');
    
    // Process pending installments daily at 9 AM UTC
    this.scheduleJob('process-installments', '0 9 * * *', () => {
      console.log('⏰ Daily installment processing job triggered');
      this.processPendingInstallments();
    });

    // Clean up old failed payments weekly on Sunday at 2 AM UTC
    this.scheduleJob('cleanup-failed-payments', '0 2 * * 0', () => {
      console.log('⏰ Weekly cleanup job triggered');
      this.cleanupFailedPayments();
    });

    // Test job - process installments every 5 minutes (for development)
    if (process.env.NODE_ENV === 'development') {
      this.scheduleJob('test-process-installments', '*/5 * * * *', () => {
        console.log('🧪 Test installment processing job triggered (dev mode)');
        this.processPendingInstallments();
      });
    }

    console.log('✅ Cron jobs scheduled successfully');
    console.log('📅 Scheduled jobs:');
    console.log('   - Daily installment processing: 9:00 AM UTC');
    console.log('   - Weekly cleanup: Sunday 2:00 AM UTC');
    if (process.env.NODE_ENV === 'development') {
      console.log('   - Test processing: Every 5 minutes (dev mode)');
    }
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
    const startTime = new Date();
    console.log('🔄 Processing pending installments...', { startTime: startTime.toISOString() });
    
    try {
      const pendingInstallments = await databaseService.getPendingInstallments();
      
      if (pendingInstallments.length === 0) {
        console.log('✅ No pending installments to process');
        return;
      }

      console.log(`📊 Found ${pendingInstallments.length} pending installments`);
      
      let successCount = 0;
      let failureCount = 0;
      const errors: string[] = [];

      for (const installment of pendingInstallments) {
        try {
          const result = await this.processInstallment(installment);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            errors.push(`Installment ${installment.id}: ${result.error}`);
          }
        } catch (error) {
          failureCount++;
          const errorMsg = `Installment ${installment.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('❌ Error processing installment:', errorMsg);
        }
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      console.log('✅ Finished processing pending installments', {
        total: pendingInstallments.length,
        successful: successCount,
        failed: failureCount,
        duration: `${duration}ms`,
        endTime: endTime.toISOString()
      });

      if (errors.length > 0) {
        console.error('❌ Processing errors:', errors);
      }

    } catch (error) {
      console.error('❌ Critical error processing pending installments:', error);
    }
  }

  private async processInstallment(installment: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`💳 Processing installment ${installment.installmentNumber} for payment ${installment.paymentId}`);

      // Get payment details to get customer info
      const payment = await databaseService.getPaymentById(installment.paymentId);
      if (!payment) {
        const error = `Payment not found: ${installment.paymentId}`;
        console.error(`❌ ${error}`);
        return { success: false, error };
      }

      // Update installment status to processing
      await databaseService.updateInstallmentStatus(installment.id, 'processing');

      // Process payment with GreenPay API
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
        
        console.log(`✅ Installment ${installment.installmentNumber} processed successfully via GreenPay`, {
          transactionId: paymentResult.transactionId,
          amount: installment.amount
        });
        
        // Check if this was the last installment
        const allInstallments = await databaseService.getInstallmentsByPaymentId(installment.paymentId);
        const paidInstallments = allInstallments.filter(i => i.status === 'paid');
        
        if (paidInstallments.length === allInstallments.length) {
          console.log(`🎉 All installments completed for payment ${installment.paymentId}`);
          // Update the main payment status to completed
          await databaseService.updatePaymentStatus(installment.paymentId, 'completed');
        }
        
        return { success: true };
      } else {
        // Update installment status to failed
        await databaseService.updateInstallmentStatus(installment.id, 'failed');
        const error = `GreenPay payment failed: ${paymentResult.message}`;
        console.error(`❌ Installment ${installment.installmentNumber} failed: ${error}`);
        return { success: false, error };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error processing installment ${installment.id}:`, errorMsg);
      
      // Update installment status to failed
      try {
        await databaseService.updateInstallmentStatus(installment.id, 'failed');
      } catch (updateError) {
        console.error('❌ Failed to update installment status:', updateError);
      }
      
      return { success: false, error: errorMsg };
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
