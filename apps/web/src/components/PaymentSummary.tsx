'use client';

import { PaymentRequest } from '@/types/payment';
import { CreditCard, Calendar, User, Mail, Phone, DollarSign, CheckCircle, ArrowLeft, Lock } from 'lucide-react';

interface PaymentSummaryProps {
  paymentData: PaymentRequest;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function PaymentSummary({ paymentData, onConfirm, onBack, isLoading }: PaymentSummaryProps) {
  const calculateInstallmentAmounts = () => {
    if (paymentData.paymentType === 'installment' && paymentData.installmentCount && paymentData.amount) {
      const remainingAmount = paymentData.amount - (paymentData.downPayment || 0);
      const baseAmount = Math.floor(remainingAmount / paymentData.installmentCount);
      const remainder = remainingAmount % paymentData.installmentCount;
      
      const amounts = [];
      for (let i = 0; i < paymentData.installmentCount; i++) {
        // Add 1 to the first 'remainder' installments to distribute the extra amount
        amounts.push(baseAmount + (i < remainder ? 1 : 0));
      }
      return amounts;
    }
    return [];
  };

  const installmentAmounts = calculateInstallmentAmounts();
  const downPayment = paymentData.downPayment || 0;
  const remainingAmount = paymentData.amount - downPayment;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Summary</h2>
        <p className="text-gray-600">Please review your payment details before proceeding</p>
      </div>

      {/* Payment Details Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          Payment Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-800">${paymentData.amount.toLocaleString()}</span>
              </div>
            </div>

            {paymentData.paymentType === 'installment' && downPayment > 0 && (
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Down Payment:</span>
                  <span className="text-xl font-bold text-green-600">${downPayment.toLocaleString()}</span>
                </div>
              </div>
            )}

            {paymentData.paymentType === 'installment' && (
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Remaining Amount:</span>
                  <span className="text-xl font-bold text-purple-600">${remainingAmount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Type */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Payment Type:</span>
              </div>
              <p className="text-lg font-bold text-blue-600 capitalize">
                {paymentData.paymentType === 'full' ? 'Pay in Full' : 'Installment Plan'}
              </p>
            </div>

            {paymentData.paymentType === 'installment' && (
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">Installment Plan:</span>
                </div>
                                 <p className="text-lg font-bold text-purple-600">
                   {paymentData.installmentCount} payments of ${Math.min(...installmentAmounts).toLocaleString()} - ${Math.max(...installmentAmounts).toLocaleString()} each
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          Customer Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">Full Name:</span>
            </div>
            <p className="text-lg text-gray-700">{paymentData.customerInfo.name}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-800">Email:</span>
            </div>
            <p className="text-lg text-gray-700">{paymentData.customerInfo.email}</p>
          </div>

          {paymentData.customerInfo.phone && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-purple-500" />
                <span className="font-semibold text-gray-800">Phone:</span>
              </div>
              <p className="text-lg text-gray-700">{paymentData.customerInfo.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Installment Schedule (if applicable) */}
      {paymentData.paymentType === 'installment' && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            Installment Schedule
          </h3>

                     <div className="space-y-3">
             {Array.from({ length: paymentData.installmentCount || 0 }, (_, index) => {
               const installmentNumber = index + 1;
               const isFirstInstallment = installmentNumber === 1;
               const amount = isFirstInstallment && downPayment > 0 ? downPayment : installmentAmounts[index] || 0;
               const dueDate = new Date();
               
               if (isFirstInstallment && downPayment > 0) {
                 dueDate.setDate(dueDate.getDate()); // Today
               } else {
                 dueDate.setMonth(dueDate.getMonth() + (downPayment > 0 ? installmentNumber - 1 : installmentNumber));
               }

               return (
                 <div key={installmentNumber} className="bg-white rounded-xl p-4 border border-purple-200">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                         {installmentNumber}
                       </div>
                       <div>
                         <p className="font-semibold text-gray-800">
                           {isFirstInstallment && downPayment > 0 ? 'Down Payment' : `Installment ${installmentNumber}`}
                         </p>
                         <p className="text-sm text-gray-600">
                           Due: {dueDate.toLocaleDateString()}
                         </p>
                       </div>
                     </div>
                     <span className="text-xl font-bold text-purple-600">${amount.toLocaleString()}</span>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Edit
        </button>
        
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 focus:ring-4 focus:ring-green-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-6 h-6" />
              <span>Confirm & Pay</span>
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          Your payment will be processed securely through GreenPay
        </p>
      </div>
    </div>
  );
}
