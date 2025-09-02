'use client';

import { PaymentResponse } from '@/types/payment';
import { CheckCircle, XCircle, Calendar, DollarSign, RotateCcw } from 'lucide-react';

interface PaymentResultProps {
  result: PaymentResponse;
  onReset: () => void;
}

export function PaymentResult({ result, onReset }: PaymentResultProps) {
  const isSuccess = result.success;

  return (
    <div className="text-center space-y-8">
      {/* Status Icon */}
      <div className="flex justify-center">
        {isSuccess ? (
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        ) : (
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
            <XCircle className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      {/* Status Message */}
      <div>
        <h2 className={`text-3xl font-bold mb-3 ${
          isSuccess ? 'text-green-700' : 'text-red-700'
        }`}>
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">{result.message}</p>
      </div>

      {/* Payment Details */}
      {isSuccess && result.transactionDetails && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 space-y-6 border-2 border-green-200">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            Transaction Details
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-green-200">
              <span className="flex items-center gap-3 text-gray-700 font-medium">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Amount Paid:
              </span>
              <span className="text-2xl font-bold text-green-600">${result.transactionDetails.amount.toLocaleString()}</span>
            </div>

            {result.transactionDetails.installmentCount && (
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-blue-200">
                <span className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Total Installments:
                </span>
                <span className="text-xl font-bold text-blue-600">{result.transactionDetails.installmentCount}</span>
              </div>
            )}

            {result.transactionDetails.nextPaymentDate && (
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-purple-200">
                <span className="flex items-center gap-3 text-gray-700 font-medium">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  Next Payment:
                </span>
                <span className="text-lg font-bold text-purple-600">
                  {new Date(result.transactionDetails.nextPaymentDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-3 px-4 bg-gray-100 rounded-xl">
              <span className="text-gray-700 font-medium">Payment ID:</span>
              <span className="font-mono text-sm bg-gray-200 px-3 py-2 rounded-lg border">
                {result.paymentId}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Installment Information */}
      {isSuccess && result.transactionDetails?.installmentCount && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2 text-lg">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
              <Calendar className="w-3 h-3 text-white" />
            </div>
            Installment Plan Active
          </h4>
          <p className="text-blue-700 leading-relaxed">
            Your installment plan has been set up successfully. Future payments will be 
            automatically processed on their due dates. You will receive email notifications 
            before each payment.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <RotateCcw className="w-5 h-5" />
          Make Another Payment
        </button>
        
        {isSuccess && (
          <button
            onClick={() => window.print()}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105"
          >
            Print Receipt
          </button>
        )}
      </div>

      {/* Additional Information */}
      {isSuccess && (
        <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
          <h5 className="font-semibold text-gray-800 text-center mb-4">Important Information</h5>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p>You will receive a confirmation email shortly</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p>Keep your Payment ID for future reference</p>
            </div>
            {result.transactionDetails?.installmentCount && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p>Installment payments will be processed automatically</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
