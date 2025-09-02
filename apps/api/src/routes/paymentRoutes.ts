import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

// Payment processing routes
router.post('/process', paymentController.processPayment);
router.get('/:paymentId', paymentController.getPaymentDetails);
router.get('/:paymentId/installments', paymentController.getInstallmentDetails);

// Cron job management routes
router.post('/cron/process-installments', paymentController.triggerInstallmentProcessing);
router.get('/cron/status', paymentController.getCronJobStatus);

// Health check for payments
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'Payment Routes',
    timestamp: new Date().toISOString()
  });
});

export { router as paymentRoutes };
