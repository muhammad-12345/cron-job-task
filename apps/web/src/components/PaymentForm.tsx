'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentRequest } from '@/types/payment';
import { 
  CreditCard, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  DollarSign,
  Lock
} from 'lucide-react';

const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentType: z.enum(['full', 'installment']),
  downPayment: z.number().min(0).optional(),
  installmentCount: z.union([z.literal(3), z.literal(6), z.literal(12)]).optional(),
  customerInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
  }),
}).refine((data) => {
  if (data.paymentType === 'installment') {
    return data.installmentCount !== undefined;
  }
  return true;
}, {
  message: 'Installment count is required for installment payments',
  path: ['installmentCount'],
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentRequest) => void;
  isLoading: boolean;
}

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  const [paymentType, setPaymentType] = useState<'full' | 'installment'>('full');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: 'full',
      amount: 1000,
    },
  });

  const watchedAmount = watch('amount');
  const watchedDownPayment = watch('downPayment') || 0;
  const watchedInstallmentCount = watch('installmentCount') as 3 | 6 | 12 | undefined;

  const handlePaymentTypeChange = (type: 'full' | 'installment') => {
    setPaymentType(type);
    setValue('paymentType', type);
    if (type === 'full') {
      setValue('downPayment', undefined);
      setValue('installmentCount', undefined);
    }
  };

  const calculateInstallmentAmount = () => {
    if (paymentType === 'installment' && watchedInstallmentCount && watchedAmount) {
      const remainingAmount = watchedAmount - watchedDownPayment;
      return Math.round(remainingAmount / watchedInstallmentCount);
    }
    return 0;
  };

  const installmentAmount = calculateInstallmentAmount();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Amount Input */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-gray-800" />
          </div>
          Total Amount ($)
        </label>
        <div className="relative">
          <input
            type="number"
            {...register('amount', { valueAsNumber: true })}
            className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg font-medium text-gray-900"
            placeholder="0.00"
            min="1"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
            $
          </div>
        </div>
        {errors.amount && (
          <p className="text-red-500 text-sm font-medium flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Payment Type Selection */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-gray-800" />
          </div>
          Choose Payment Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => handlePaymentTypeChange('full')}
            className={`group p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
              paymentType === 'full'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-500/25'
                : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                paymentType === 'full'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-blue-200'
              }`}>
                <CreditCard className={`w-8 h-8 ${
                  paymentType === 'full' ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                }`} />
              </div>
              <h4 className={`font-bold text-lg mb-2 ${
                paymentType === 'full' ? 'text-blue-700' : 'text-gray-800'
              }`}>Pay in Full</h4>
              <p className={`text-sm ${
                paymentType === 'full' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Complete payment upfront with instant processing
              </p>
              {paymentType === 'full' && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
                  Selected
                </div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePaymentTypeChange('installment')}
            className={`group p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
              paymentType === 'installment'
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-500/25'
                : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-lg'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all ${
                paymentType === 'installment'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-purple-200'
              }`}>
                <Calendar className={`w-8 h-8 ${
                  paymentType === 'installment' ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'
                }`} />
              </div>
              <h4 className={`font-bold text-lg mb-2 ${
                paymentType === 'installment' ? 'text-purple-700' : 'text-gray-800'
              }`}>Pay in Installments</h4>
              <p className={`text-sm ${
                paymentType === 'installment' ? 'text-purple-600' : 'text-gray-600'
              }`}>
                Spread payments over 3, 6, or 12 months
              </p>
              {paymentType === 'installment' && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-medium">
                  Selected
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Installment Options */}
      {paymentType === 'installment' && (
        <div className="space-y-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
          <h4 className="font-bold text-gray-800 flex items-center gap-3 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            Installment Plan Configuration
          </h4>
          
          {/* Down Payment */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md flex items-center justify-center">
                <DollarSign className="w-3 h-3 text-white" />
              </div>
              Down Payment ($) - Optional
            </label>
            <div className="relative">
              <input
                type="number"
                {...register('downPayment', { valueAsNumber: true })}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-gray-900"
                placeholder="0.00"
                min="0"
                max={watchedAmount && watchedAmount > 0 ? watchedAmount - 1 : undefined}
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                $
              </div>
            </div>
            {errors.downPayment && (
              <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
                {errors.downPayment.message}
              </p>
            )}
          </div>

          {/* Installment Count */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                <Calendar className="w-3 h-3 text-white" />
              </div>
              Number of Installments
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[3, 6, 12].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setValue('installmentCount', count as 3 | 6 | 12)}
                  className={`group p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    watchedInstallmentCount === count
                      ? 'border-purple-500 bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg shadow-purple-500/25'
                      : 'border-gray-200 hover:border-purple-300 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${
                      watchedInstallmentCount === count ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {count}
                    </div>
                    <div className={`text-sm font-medium ${
                      watchedInstallmentCount === count ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {count === 3 ? '3 Months' : count === 6 ? '6 Months' : '12 Months'}
                    </div>
                    {watchedInstallmentCount === count && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-medium">
                        Selected
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors.installmentCount && (
              <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
                {errors.installmentCount.message}
              </p>
            )}
          </div>

          {/* Payment Summary */}
          {watchedInstallmentCount && watchedAmount && (
            <div className="p-6 bg-white rounded-2xl border-2 border-purple-200 shadow-lg">
              <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md flex items-center justify-center">
                  <DollarSign className="w-3 h-3 text-gray-800" />
                </div>
                Payment Summary
              </h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-800">${watchedAmount.toLocaleString()}</span>
                </div>
                {watchedDownPayment > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Down Payment:</span>
                    <span className="text-lg font-bold text-green-600">${watchedDownPayment.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Remaining Amount:</span>
                  <span className="text-lg font-bold text-blue-600">${(watchedAmount - watchedDownPayment).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg px-4">
                  <span className="text-gray-700 font-semibold">Per Installment:</span>
                  <span className="text-2xl font-bold text-purple-600">${installmentAmount.toLocaleString()}</span>
                </div>
                <div className="text-center text-sm text-gray-500 mt-3">
                  {watchedInstallmentCount} payments of ${installmentAmount.toLocaleString()} each
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Information */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-gray-800" />
          </div>
          Customer Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                <User className="w-3 h-3 text-gray-800" />
              </div>
              Full Name
            </label>
            <input
              type="text"
              {...register('customerInfo.name')}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900"
              placeholder="Enter your full name"
            />
            {errors.customerInfo?.name && (
              <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
                {errors.customerInfo.name.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md flex items-center justify-center">
                <Mail className="w-3 h-3 text-gray-800" />
              </div>
              Email Address
            </label>
            <input
              type="email"
              {...register('customerInfo.email')}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-gray-900"
              placeholder="Enter your email"
            />
            {errors.customerInfo?.email && (
              <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
                {errors.customerInfo.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
              <Phone className="w-3 h-3 text-gray-800" />
            </div>
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            {...register('customerInfo.phone')}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-gray-900"
            placeholder="Enter your phone number"
          />
          {errors.customerInfo?.phone && (
            <p className="text-red-500 text-sm font-medium flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">!</span>
              {errors.customerInfo.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-5 px-8 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <CreditCard className="w-6 h-6" />
              <span>Review Payment</span>
            </div>
          )}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Your payment information is secure and encrypted via GreenPay
          </p>
        </div>
      </div>
    </form>
  );
}
