import React from 'react';
import { CheckCircle2, Truck, ArrowRight, Printer, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { RakoMartLogo } from './RakoMartLogo';

export const OrderConfirmationView: React.FC = () => {
  const { lastCreatedOrder, navigateTo, settings } = useStore();

  if (!lastCreatedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-neutral-800 mb-2">No Recent Order Found</h3>
        <button
          onClick={() => navigateTo('home')}
          className="bg-[#281044] text-white text-xs font-bold px-6 py-2.5 rounded-full"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Format WhatsApp Link using configured Admin/Customer Care WhatsApp number
  let rawPhone = settings.customerCarePhone || '8801894567890';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '88' + cleanPhone;
  } else if (!cleanPhone.startsWith('88') && cleanPhone.length === 10) {
    cleanPhone = '880' + cleanPhone;
  }

  const whatsappMessage = `Hello RakoMart, I have placed an order.\n\nOrder ID: ${lastCreatedOrder.id}\nName: ${lastCreatedOrder.customerName}\nMobile: ${lastCreatedOrder.customerMobile}\nTotal Amount: ৳${lastCreatedOrder.total.toLocaleString()}\n\nPlease confirm my order.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

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
          Your order has been placed successfully!
        </h1>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-lg mx-auto">
          Thank you, <span className="font-bold">{lastCreatedOrder.customerName}</span>! We are preparing your cosmetics for fast delivery.
        </p>
      </div>

      {/* Printable Invoice Receipt Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-md space-y-6 print:shadow-none print:border-none">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 gap-4">
          <div className="flex items-center gap-3">
            <RakoMartLogo size="sm" />
            <div>
              <span className="text-[10px] font-bold text-[#281044] uppercase tracking-wider block">
                Official Invoice
              </span>
              <h2 className="text-lg font-mono font-extrabold text-neutral-900">
                #{lastCreatedOrder.id}
              </h2>
              <span className="text-[11px] text-neutral-500">
                Date: {new Date(lastCreatedOrder.createdAt).toLocaleDateString('en-US')}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-neutral-500 block mb-1">Order Status</span>
            <span className="inline-block bg-purple-100 text-[#281044] text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
              {lastCreatedOrder.orderStatus}
            </span>
          </div>
        </div>

        {/* Customer & Delivery Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
          <div>
            <h4 className="font-bold text-neutral-900 mb-1 border-b pb-1">Customer Details</h4>
            <p className="font-semibold text-neutral-800">{lastCreatedOrder.customerName}</p>
            <p className="text-neutral-600">Mobile: {lastCreatedOrder.customerMobile}</p>
            {lastCreatedOrder.customerEmail && (
              <p className="text-neutral-600">Email: {lastCreatedOrder.customerEmail}</p>
            )}
          </div>

          <div>
            <h4 className="font-bold text-neutral-900 mb-1 border-b pb-1">Delivery Address</h4>
            <p className="text-neutral-700 font-medium">
              District: {lastCreatedOrder.district}, Upazila/Thana: {lastCreatedOrder.upazila}
            </p>
            <p className="text-neutral-600 mt-0.5">{lastCreatedOrder.address}</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h4 className="text-xs font-bold text-neutral-800 mb-2">Ordered Items:</h4>
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-700 font-bold border-b">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {lastCreatedOrder.items.map((item) => (
                  <tr key={item.product.id}>
                    <td className="p-3 font-medium text-neutral-900">{item.product.title}</td>
                    <td className="p-3 text-center font-bold">{item.quantity} pcs</td>
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
            <span>Subtotal:</span>
            <span className="font-bold">৳{lastCreatedOrder.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-neutral-700">
            <span>Delivery Fee:</span>
            <span className="font-bold">৳{lastCreatedOrder.deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-[#281044] pt-2 border-t border-purple-200">
            <span>Total Payable Amount:</span>
            <span>৳{lastCreatedOrder.total.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-purple-200/80 flex flex-wrap justify-between gap-2 text-[11px]">
            <div>
              <span className="text-neutral-600 font-bold">Payment Method:</span>{' '}
              <span className="uppercase font-extrabold text-[#281044]">
                {lastCreatedOrder.paymentMethod}
              </span>
            </div>

            {lastCreatedOrder.transactionId && (
              <div>
                <span className="text-neutral-600 font-bold">Transaction ID:</span>{' '}
                <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border">
                  {lastCreatedOrder.transactionId}
                </span>
              </div>
            )}

            <div>
              <span className="text-neutral-600 font-bold">Payment Verification:</span>{' '}
              <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                {lastCreatedOrder.paymentStatus === 'PROCESSING'
                  ? 'Pending Verification'
                  : lastCreatedOrder.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200 print:hidden">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white text-emerald-600 shrink-0" />
            <span>CHAT ON WHATSAPP</span>
          </a>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-neutral-300"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Invoice</span>
            </button>

            <button
              onClick={() => navigateTo('order_tracking')}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#281044] hover:bg-[#3b1763] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Truck className="w-4 h-4 text-purple-300" />
              <span>Track Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
