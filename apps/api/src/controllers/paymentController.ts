import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { PaymentRequest } from '../types';

export class PaymentController {
  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentRequest: PaymentRequest = req.body;

      // Validate required fields
      if (!paymentRequest.amount || paymentRequest.amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Valid amount is required'
        });
        return;
      }

      if (!paymentRequest.paymentType || !['full', 'installment'].includes(paymentRequest.paymentType)) {
        res.status(400).json({
          success: false,
          message: 'Payment type must be either "full" or "installment"'
        });
        return;
      }

      if (!paymentRequest.customerInfo?.name || !paymentRequest.customerInfo?.email) {
        res.status(400).json({
          success: false,
          message: 'Customer name and email are required'
        });
        return;
      }

      // Validate installment-specific fields
      if (paymentRequest.paymentType === 'installment') {
        if (!paymentRequest.installmentCount || ![3, 6, 12].includes(paymentRequest.installmentCount)) {
          res.status(400).json({
            success: false,
            message: 'Installment count must be 3, 6, or 12'
          });
          return;
        }

        if (paymentRequest.downPayment && paymentRequest.downPayment < 0) {
          res.status(400).json({
            success: false,
            message: 'Down payment cannot be negative'
          });
          return;
        }

        if (paymentRequest.downPayment && paymentRequest.downPayment >= paymentRequest.amount) {
          res.status(400).json({
            success: false,
            message: 'Down payment must be less than total amount'
          });
          return;
        }
      }

      const result = await paymentService.processPayment(paymentRequest);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Payment controller error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getPaymentDetails(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
        return;
      }

      const payment = await paymentService.getPaymentDetails(paymentId);

      if (!payment) {
        res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getInstallmentDetails(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        res.status(400).json({
          success: false,
          message: 'Payment ID is required'
        });
        return;
      }

      const installments = await paymentService.getInstallmentDetails(paymentId);

      res.status(200).json({
        success: true,
        data: installments
      });
    } catch (error) {
      console.error('Get installment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export const paymentController = new PaymentController();
