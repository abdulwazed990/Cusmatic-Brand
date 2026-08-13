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

const PRIMARY_NAGAD_URL =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF6AKMoHA4ZredzR1-dwcFJ8-N4bM52NQAXBHS2tpUCYEMWZrlKBFDPhY&s=10';
const FALLBACK_NAGAD_URL = 'https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png';

const PRIMARY_BKASH_URL = 'https://download.logo.wine/logo/BKash/BKash-Logo.wine.png';

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
  const bkashNumber = settings.bkashNumber || '01894567890';
  const nagadNumber = settings.nagadNumber || '01994567890';

  const bkashLogo = settings.bkashLogoUrl || PRIMARY_BKASH_URL;
  const nagadLogo = settings.nagadLogoUrl || PRIMARY_NAGAD_URL;

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
    <div className="space-y-6">
      {/* Step 1: Payment Method Selector Cards */}
      <div>
        <label className="block text-xs font-extrabold text-neutral-800 uppercase tracking-wider mb-3">
          Select Payment Method
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* bKash Selector Card */}
          <button
            type="button"
            onClick={() => onMethodChange('bkash')}
            className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer min-h-[150px] sm:min-h-[175px] group ${
              selectedMethod === 'bkash'
                ? 'border-[#D12053] bg-pink-100/90 shadow-md ring-2 ring-[#D12053]/30 scale-[1.02]'
                : 'border-pink-200/80 bg-pink-50/40 hover:bg-pink-100/60 hover:border-pink-400'
            }`}
          >
            <div className="w-full h-16 sm:h-20 lg:h-24 flex items-center justify-center p-1 bg-transparent">
              <img
                src={bkashLogo}
                alt="bKash Logo"
                className="max-h-full max-w-full h-16 sm:h-20 lg:h-24 object-contain mix-blend-multiply filter drop-shadow-xs transition-transform group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PRIMARY_BKASH_URL;
                }}
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs sm:text-base font-black text-neutral-900 block tracking-wide">
                bKash
              </span>
              <span className="text-[10px] sm:text-xs text-[#D12053] font-bold block mt-0.5">
                Digital Wallet
              </span>
            </div>
          </button>

          {/* Nagad Selector Card */}
          <button
            type="button"
            onClick={() => onMethodChange('nagad')}
            className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer min-h-[150px] sm:min-h-[175px] group ${
              selectedMethod === 'nagad'
                ? 'border-[#E31837] bg-orange-100/90 shadow-md ring-2 ring-[#E31837]/30 scale-[1.02]'
                : 'border-orange-200/80 bg-orange-50/40 hover:bg-orange-100/60 hover:border-orange-400'
            }`}
          >
            <div className="w-full h-16 sm:h-20 lg:h-24 flex items-center justify-center p-1 bg-transparent">
              <img
                src={nagadLogo}
                alt="Nagad Logo"
                className="max-h-full max-w-full h-16 sm:h-20 lg:h-24 object-contain mix-blend-multiply filter drop-shadow-xs transition-transform group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_NAGAD_URL;
                }}
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs sm:text-base font-black text-neutral-900 block tracking-wide">
                Nagad
              </span>
              <span className="text-[10px] sm:text-xs text-[#E31837] font-bold block mt-0.5">
                Digital Wallet
              </span>
            </div>
          </button>

          {/* Cash on Delivery Selector Card */}
          <button
            type="button"
            onClick={() => onMethodChange('cod')}
            className={`col-span-2 sm:col-span-1 p-4 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all cursor-pointer min-h-[150px] sm:min-h-[175px] group ${
              selectedMethod === 'cod'
                ? 'border-[#281044] bg-purple-100/90 shadow-md ring-2 ring-[#281044]/30 scale-[1.02]'
                : 'border-purple-200/80 bg-purple-50/40 hover:bg-purple-100/60 hover:border-purple-400'
            }`}
          >
            <div className="w-full h-16 sm:h-20 lg:h-24 flex items-center justify-center p-1 text-[#281044] bg-transparent">
              <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-[#281044] drop-shadow-xs transition-transform group-hover:scale-110" />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs sm:text-base font-black text-neutral-900 block tracking-wide">
                Cash on Delivery
              </span>
              <span className="text-[10px] sm:text-xs text-purple-900 font-bold block mt-0.5">
                Pay on Receipt
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Step 2: Payment Details Panel (bKash or Nagad) */}
      {selectedMethod !== 'cod' && (
        <div
          className={`rounded-2xl border-2 p-4 sm:p-6 transition-all animate-fadeIn ${
            selectedMethod === 'bkash'
              ? 'bg-gradient-to-b from-pink-50/90 via-pink-50/40 to-white border-pink-300'
              : 'bg-gradient-to-b from-orange-50/90 via-orange-50/40 to-white border-orange-300'
          }`}
        >
          {/* Header Brand Logo & Title */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3.5 pb-4 border-b border-neutral-200 mb-5 text-center sm:text-left">
            <div className="h-16 sm:h-20 flex items-center justify-center shrink-0 bg-transparent">
              <img
                src={selectedMethod === 'bkash' ? bkashHeaderIcon : nagadHeaderIcon}
                alt={`${selectedMethod} Brand Header Logo`}
                className="h-14 sm:h-18 max-w-[220px] object-contain mix-blend-multiply drop-shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    selectedMethod === 'bkash' ? PRIMARY_BKASH_URL : PRIMARY_NAGAD_URL;
                }}
              />
            </div>
            <div>
              <h4
                className={`text-base sm:text-lg font-extrabold capitalize ${
                  selectedMethod === 'bkash' ? 'text-[#D12053]' : 'text-[#E31837]'
                }`}
              >
                {selectedMethod} Payment Instructions
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                Please Send Money or Pay to our official account number below.
              </p>
            </div>
          </div>

          {/* Payment Number & Amount Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
            {/* Number Box with COPY button */}
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                {selectedMethod.toUpperCase()} Account Number
              </span>
              <div className="flex items-center justify-between mt-1.5 gap-2">
                <span className="text-base sm:text-lg font-mono font-extrabold text-neutral-900 tracking-wide">
                  {currentNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-extrabold transition-all active:scale-95 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : selectedMethod === 'bkash'
                      ? 'bg-[#D12053] hover:bg-pink-700 text-white shadow-xs'
                      : 'bg-[#E31837] hover:bg-orange-700 text-white shadow-xs'
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
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
                Total Amount Payable
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl sm:text-2xl font-black text-[#281044]">
                  ৳{amount.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500 font-semibold">(Total)</span>
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
              className={`w-full px-3.5 py-3 bg-white border-2 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 ${
                errorMsg
                  ? 'border-red-400 focus:ring-red-200'
                  : selectedMethod === 'bkash'
                  ? 'border-pink-300 focus:ring-pink-200 focus:border-[#D12053]'
                  : 'border-orange-300 focus:ring-orange-200 focus:border-[#E31837]'
              }`}
            />
            {errorMsg && <p className="text-xs font-semibold text-red-600 mt-1">{errorMsg}</p>}
            <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-1">
              <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              Enter the Transaction ID received via SMS after completing payment.
            </p>
          </div>
        </div>
      )}

      {/* COD Notice */}
      {selectedMethod === 'cod' && (
        <div className="bg-purple-50/80 border-2 border-purple-200 p-4 rounded-2xl flex items-start gap-3">
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

