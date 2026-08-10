import React from 'react';
import { CheckCircle2, Truck, Phone, ArrowRight, Printer, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderConfirmationView: React.FC = () => {
  const { lastCreatedOrder, navigateTo, settings } = useStore();

  if (!lastCreatedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-neutral-800 mb-2">কোনো সাম্প্রতিক অর্ডার পাওয়া যায়নি</h3>
        <button
          onClick={() => navigateTo('home')}
          className="bg-[#281044] text-white text-xs font-bold px-6 py-2.5 rounded-full"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Success Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2 shadow-xs">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
          আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!
        </h1>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-lg mx-auto">
          ধন্যবাদ, <span className="font-bold">{lastCreatedOrder.customerName}</span>! আমরা দ্রুত আপনার প্রোডাক্ট প্রস্তুত করে ডেলিভারি শুরু করব।
        </p>
      </div>

      {/* Printable Invoice Receipt Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-md space-y-6 print:shadow-none print:border-none">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
          <div>
            <span className="text-xs font-bold text-[#281044] uppercase tracking-wider block">
              অফিসিয়াল ইনভয়েস (Invoice)
            </span>
            <h2 className="text-xl font-mono font-extrabold text-neutral-900">
              #{lastCreatedOrder.id}
            </h2>
            <span className="text-xs text-neutral-500">
              তারিখ: {new Date(lastCreatedOrder.createdAt).toLocaleDateString('bn-BD')}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-neutral-500 block mb-1">অর্ডার স্ট্যাটাস</span>
            <span className="inline-block bg-purple-100 text-[#281044] text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
              {lastCreatedOrder.orderStatus}
            </span>
          </div>
        </div>

        {/* Customer & Delivery Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
          <div>
            <h4 className="font-bold text-neutral-900 mb-1 border-b pb-1">কাস্টমার তথ্য</h4>
            <p className="font-semibold text-neutral-800">{lastCreatedOrder.customerName}</p>
            <p className="text-neutral-600">মোবাইল: {lastCreatedOrder.customerMobile}</p>
            {lastCreatedOrder.customerEmail && (
              <p className="text-neutral-600">ইমেইল: {lastCreatedOrder.customerEmail}</p>
            )}
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-1 border-b pb-1">ডেলিভারি ঠিকানা</h4>
            <p className="text-neutral-700 font-medium">
              জেলা: {lastCreatedOrder.district}, থানা: {lastCreatedOrder.upazila}
            </p>
            <p className="text-neutral-600 mt-0.5">{lastCreatedOrder.address}</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h4 className="text-xs font-bold text-neutral-800 mb-2">অর্ডারকৃত পণ্যসমূহ:</h4>
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-700 font-bold border-b">
                <tr>
                  <th className="p-3">প্রোডাক্ট</th>
                  <th className="p-3 text-center">পরিমাণ</th>
                  <th className="p-3 text-right">মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {lastCreatedOrder.items.map((item) => (
                  <tr key={item.product.id}>
                    <td className="p-3 font-medium text-neutral-900">{item.product.title}</td>
                    <td className="p-3 text-center font-bold">{item.quantity} টি</td>
                    <td className="p-3 text-right font-semibold">
                      ৳{(item.product.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-700">
            <span>পণ্যসমূহের মোট মূল্য (Subtotal):</span>
            <span className="font-bold">৳{lastCreatedOrder.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>ডেলিভারি চার্জ:</span>
            <span className="font-bold">৳{lastCreatedOrder.deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-[#281044] pt-2 border-t border-purple-200">
            <span>সর্বমোট পরিশোধযোগ্য মূল্য:</span>
            <span>৳{lastCreatedOrder.total.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-purple-200/80 flex flex-wrap justify-between gap-2 text-[11px]">
            <div>
              <span className="text-neutral-600 font-bold">পেমেন্ট মেথড:</span>{' '}
              <span className="uppercase font-extrabold text-[#281044]">
                {lastCreatedOrder.paymentMethod}
              </span>
            </div>

            {lastCreatedOrder.transactionId && (
              <div>
                <span className="text-neutral-600 font-bold">ট্রানজেকশন আইডি:</span>{' '}
                <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border">
                  {lastCreatedOrder.transactionId}
                </span>
              </div>
            )}

            <div>
              <span className="text-neutral-600 font-bold">পেমেন্ট ভেরিফিকেশন:</span>{' '}
              <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                {lastCreatedOrder.paymentStatus === 'PROCESSING'
                  ? 'যাচাইকরণ প্রক্রিয়াধীন (Processing)'
                  : lastCreatedOrder.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>ইনভয়েস প্রিন্ট/ডাউনলোড</span>
          </button>

          <button
            onClick={() => navigateTo('order_tracking')}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#281044] hover:bg-[#3b1763] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Truck className="w-4 h-4 text-purple-300" />
            <span>অর্ডার ট্র্যাকিং পেজে যান</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
