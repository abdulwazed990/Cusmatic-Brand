import React, { useState } from 'react';
import { Copy, CheckCircle2, ShieldCheck, Info, CreditCard } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod } from '../types';

interface PaymentGatewayProps {
  amount: number;
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  transactionId: string;
  onTransactionIdChange: (txId: string) => void;
  errorMsg?: string | null;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  selectedMethod,
  onMethodChange,
  transactionId,
  onTransactionIdChange,
  errorMsg,
}) => {
  const { settings, showToast } = useStore();
  const [copied, setCopied] = useState(false);

  // Active Provider Numbers & Logo URLs with high quality fallbacks
  const bkashNumber = settings.bkashNumber || '01800000000';
  const nagadNumber = settings.nagadNumber || '01900000000';

  const bkashLogo =
    settings.bkashLogoUrl || 'https://images.seeklogo.com/logo-png/27/1/bkash-logo-png_seeklogo-273684.png';
  const nagadLogo =
    settings.nagadLogoUrl || 'https://iconape.com/wp-content/png_logo_vector/nagad-logo.png';

  const bkashHeaderIcon = settings.bkashHeaderIconUrl || bkashLogo;
  const nagadHeaderIcon = settings.nagadHeaderIconUrl || nagadLogo;

  const currentNumber = selectedMethod === 'bkash' ? bkashNumber : nagadNumber;

  const handleCopyNumber = () => {
    if (!currentNumber) return;
    navigator.clipboard.writeText(currentNumber);
    setCopied(true);
    showToast('Payment number copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Payment Method Selector Cards */}
      <div>
        <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5">
          Select Payment Method
        </label>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          {/* bKash Selector */}
          <button
            type="button"
            onClick={() => onMethodChange('bkash')}
            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              selectedMethod === 'bkash'
                ? 'border-[#D12053] bg-pink-50/70 shadow-xs ring-1 ring-[#D12053]'
                : 'border-neutral-200 bg-white hover:border-pink-300'
            }`}
          >
            <div className="w-12 h-10 sm:w-16 sm:h-12 flex items-center justify-center p-1 mb-1">
              <img
                src={bkashLogo}
                alt="bKash payment logo"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  // Fallback vector
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-xs font-bold text-neutral-900">bKash</span>
            <span className="text-[10px] text-pink-700 font-medium mt-0.5">Digital Wallet</span>
          </button>

          {/* Nagad Selector */}
          <button
            type="button"
            onClick={() => onMethodChange('nagad')}
            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              selectedMethod === 'nagad'
                ? 'border-[#E31837] bg-orange-50/70 shadow-xs ring-1 ring-[#E31837]'
                : 'border-neutral-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className="w-12 h-10 sm:w-16 sm:h-12 flex items-center justify-center p-1 mb-1">
              <img
                src={nagadLogo}
                alt="Nagad payment logo"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-xs font-bold text-neutral-900">Nagad</span>
            <span className="text-[10px] text-orange-700 font-medium mt-0.5">Digital Wallet</span>
          </button>

          {/* Cash on Delivery Selector */}
          <button
            type="button"
            onClick={() => onMethodChange('cod')}
            className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              selectedMethod === 'cod'
                ? 'border-[#281044] bg-purple-50/70 shadow-xs ring-1 ring-[#281044]'
                : 'border-neutral-200 bg-white hover:border-purple-300'
            }`}
          >
            <div className="w-12 h-10 sm:w-16 sm:h-12 flex items-center justify-center p-1 mb-1 text-[#281044]">
              <CreditCard className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-neutral-900">COD</span>
            <span className="text-[10px] text-purple-900 font-medium mt-0.5">Cash on Delivery</span>
          </button>
        </div>
      </div>

      {/* Step 2: Payment Theme Panel (Only for bKash & Nagad) */}
      {selectedMethod !== 'cod' && (
        <div
          className={`rounded-xl border p-4 sm:p-5 transition-all animate-fadeIn ${
            selectedMethod === 'bkash'
              ? 'bg-gradient-to-b from-pink-50/80 to-white border-pink-200'
              : 'bg-gradient-to-b from-orange-50/80 to-white border-orange-200'
          }`}
        >
          {/* Header Provider Icon & Title */}
          <div className="flex items-center gap-3 pb-3 border-b border-neutral-200/60 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white p-1 border shadow-2xs flex items-center justify-center shrink-0">
              <img
                src={selectedMethod === 'bkash' ? bkashHeaderIcon : nagadHeaderIcon}
                alt={`${selectedMethod} header icon`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h4
                className={`text-sm font-bold capitalize ${
                  selectedMethod === 'bkash' ? 'text-[#D12053]' : 'text-[#E31837]'
                }`}
              >
                {selectedMethod} Payment Instructions
              </h4>
              <p className="text-[11px] text-neutral-600">
                Please Send Money or Pay to the account number shown below.
              </p>
            </div>
          </div>

          {/* Payment Number & Amount Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Number Box with COPY button */}
            <div className="bg-white p-3 rounded-lg border border-neutral-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                {selectedMethod.toUpperCase()} Account Number
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900">
                  {currentNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : selectedMethod === 'bkash'
                      ? 'bg-[#D12053] hover:bg-pink-700 text-white'
                      : 'bg-[#E31837] hover:bg-orange-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY NUMBER</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Amount Box */}
            <div className="bg-white p-3 rounded-lg border border-neutral-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Total Amount Payable
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg sm:text-xl font-extrabold text-[#281044]">
                  ৳{amount.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 font-medium">(Total)</span>
              </div>
            </div>
          </div>

          {/* Transaction ID Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-800">
              Transaction ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => onTransactionIdChange(e.target.value.toUpperCase().trim())}
              placeholder="e.g. 9B7X210K89 or TRX123456"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 ${
                errorMsg
                  ? 'border-red-400 focus:ring-red-200'
                  : selectedMethod === 'bkash'
                  ? 'border-pink-300 focus:ring-pink-200 focus:border-[#D12053]'
                  : 'border-orange-300 focus:ring-orange-200 focus:border-[#E31837]'
              }`}
            />
            {errorMsg && <p className="text-xs font-semibold text-red-600 mt-1">{errorMsg}</p>}
            <p className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-neutral-400 shrink-0" />
              Enter the Transaction ID received via SMS after completing the payment.
            </p>
          </div>
        </div>
      )}

      {/* COD Notice */}
      {selectedMethod === 'cod' && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#281044] shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-700 leading-relaxed">
            <span className="font-bold text-[#281044] block text-sm mb-0.5">
              Cash on Delivery (COD)
            </span>
            Pay cash directly to the delivery person upon receiving your product package. Delivery takes 24-48 hours inside Dhaka and 2-3 business days outside Dhaka.
          </div>
        </div>
      )}
    </div>
  );
};
