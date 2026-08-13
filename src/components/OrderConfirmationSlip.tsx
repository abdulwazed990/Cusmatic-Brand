import React from 'react';
import { CheckCircle2, MessageCircle, Download, X, Printer, ShieldCheck, MapPin } from 'lucide-react';
import { Order, AdminSettings } from '../types';
import { RakoMartLogo } from './RakoMartLogo';

interface OrderConfirmationSlipProps {
  order: Order;
  settings: AdminSettings;
  onClose: () => void;
  onPrintInvoice?: () => void;
}

export const OrderConfirmationSlip: React.FC<OrderConfirmationSlipProps> = ({
  order,
  settings,
  onClose,
  onPrintInvoice,
}) => {
  // Format WhatsApp Link using configured Admin/Customer Care WhatsApp number
  let rawPhone = settings.customerCarePhone || '8801894567890';
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '88' + cleanPhone;
  } else if (!cleanPhone.startsWith('88') && cleanPhone.length === 10) {
    cleanPhone = '880' + cleanPhone;
  }

  const whatsappMessage = `Hello RakoMart, I have placed an order.\n\nOrder ID: ${order.id}\nName: ${order.customerName}\nMobile: ${order.customerMobile}\nTotal Amount: ৳${order.total.toLocaleString()}\n\nPlease confirm my order.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  const handlePrint = () => {
    if (onPrintInvoice) {
      onPrintInvoice();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-auto relative text-neutral-800">
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors z-10"
          title="Close Confirmation Slip"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-[#281044] text-white p-5 text-center relative space-y-1">
          <div className="flex justify-center mb-1">
            <RakoMartLogo size="sm" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-200">
            ORDER CONFIRMED
          </h2>
          <div className="pt-2 flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>✓ Order Placed Successfully</span>
          </div>
        </div>

        {/* Slip Body Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          
          {/* Order ID Banner */}
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3 text-center">
            <span className="text-[10px] font-bold uppercase text-purple-900 tracking-wider block">
              Order ID
            </span>
            <span className="text-base font-mono font-extrabold text-[#281044] select-all">
              {order.id}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">
              Status: <strong className="text-emerald-700">{order.orderStatus || 'Order Received'}</strong>
            </span>
          </div>

          {/* Customer Details */}
          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] pb-1 border-b border-neutral-200">
              <span className="font-bold text-neutral-500 uppercase">Customer Info</span>
              <span className="text-neutral-400 text-[10px]">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
              <div>
                <span className="text-neutral-500 text-[10px] block">Name</span>
                <span className="font-bold text-neutral-900 truncate block">{order.customerName}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] block">Mobile</span>
                <span className="font-bold text-neutral-900 truncate block">{order.customerMobile}</span>
              </div>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">Delivery Location</span>
              <span className="font-semibold text-neutral-800 text-[11px] block truncate">
                {order.upazila}, {order.district} ({order.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
              </span>
              <p className="text-[11px] text-neutral-600 truncate mt-0.5">{order.address}</p>
            </div>
          </div>

          {/* Items Summary List */}
          <div className="space-y-1.5">
            <span className="font-bold text-neutral-600 text-[11px] block uppercase">Ordered Items ({order.items.length})</span>
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 divide-y divide-neutral-200 max-h-36 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-8 h-8 rounded object-cover border border-neutral-200 shrink-0 bg-white"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate text-[11px]">{item.product.title}</p>
                      <p className="text-[10px] text-neutral-500">
                        ৳{item.product.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 text-xs shrink-0">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-neutral-100/80 rounded-xl p-3 border border-neutral-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-neutral-900">৳{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery Fee ({order.deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
              <span className="font-semibold text-neutral-900">৳{order.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#281044] pt-1.5 border-t border-neutral-300">
              <span>TOTAL PAYABLE:</span>
              <span>৳{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
              <span>Payment Method:</span>
              <span className="font-bold uppercase text-[#281044]">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* WhatsApp Direct Chat Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600 shrink-0" />
              <span>CHAT ON WHATSAPP</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handlePrint}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs py-2.5 rounded-xl border border-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>INVOICE</span>
              </button>

              <button
                onClick={onClose}
                className="w-full bg-[#281044] hover:bg-[#3b1763] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 transition-colors"
              >
                <span>CLOSE</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
