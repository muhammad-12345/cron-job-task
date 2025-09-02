'use client';

import { useState } from 'react';
import { PaymentForm } from '@/components/PaymentForm';
import { PaymentResult } from '@/components/PaymentResult';
import { PaymentSummary } from '@/components/PaymentSummary';
import { PaymentRequest, PaymentResponse } from '@/types/payment';
import { Shield, CreditCard, Clock, CheckCircle } from 'lucide-react';

export default function Home() {
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentRequest | null>(null);
  const [currentStep, setCurrentStep] = useState<'form' | 'summary' | 'result'>('form');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (data: PaymentRequest) => {
    setPaymentData(data);
    setCurrentStep('summary');
  };

  const handlePaymentConfirm = async () => {
    if (!paymentData) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();
      setPaymentResult(result);
      setCurrentStep('result');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentResult({
        success: false,
        paymentId: '',
        message: 'Payment processing failed. Please try again.',
      });
      setCurrentStep('result');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setPaymentData(null);
  };

  const handleReset = () => {
    setPaymentResult(null);
    setPaymentData(null);
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PayFlow</h1>
                <p className="text-sm text-gray-300">Secure Payment Solutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-400">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              Flexible Payment
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Solutions</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Choose between instant full payment or flexible installment plans. 
              Secure, fast, and designed for your convenience.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Instant Payments</h3>
                <p className="text-gray-300 text-sm">Process full payments immediately with our secure gateway</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Flexible Installments</h3>
                <p className="text-gray-300 text-sm">Spread payments over 3, 6, or 12 months with automatic processing</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Automated Processing</h3>
                <p className="text-gray-300 text-sm">Cron jobs handle recurring payments automatically and securely</p>
              </div>
            </div>
          </div>

          {/* Payment Form Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white">
                {currentStep === 'form' && 'Payment Processing'}
                {currentStep === 'summary' && 'Payment Summary'}
                {currentStep === 'result' && 'Payment Result'}
              </h3>
              <p className="text-blue-100 mt-1">
                {currentStep === 'form' && 'Complete your transaction securely'}
                {currentStep === 'summary' && 'Review your payment details'}
                {currentStep === 'result' && 'Transaction completed'}
              </p>
            </div>
            
            <div className="p-8">
              {currentStep === 'form' && (
                <PaymentForm 
                  onSubmit={handleFormSubmit} 
                  isLoading={isLoading}
                />
              )}
              
              {currentStep === 'summary' && paymentData && (
                <PaymentSummary 
                  paymentData={paymentData}
                  onConfirm={handlePaymentConfirm}
                  onBack={handleBackToForm}
                  isLoading={isLoading}
                />
              )}
              
              {currentStep === 'result' && paymentResult && (
                <PaymentResult 
                  result={paymentResult} 
                  onReset={handleReset}
                />
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm">256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">PCI DSS Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span className="text-sm">Multiple Payment Methods</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              © 2024 PayFlow. All rights reserved. | 
              <span className="mx-2">•</span>
              Secure payment processing powered by advanced installment technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}