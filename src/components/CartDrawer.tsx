import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    navigateTo,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigateTo('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transition-transform duration-300">
        {/* Header */}
        <div className="p-4 bg-[#281044] text-white flex items-center justify-between border-b border-purple-900">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-300" />
            <h3 className="font-bold text-base">শপিং কার্ট (Your Cart)</h3>
            <span className="text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full font-semibold">
              {cart.reduce((a, b) => a + b.quantity, 0)} টি
            </span>
          </div>

          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="p-1.5 text-purple-200 hover:text-white hover:bg-purple-800/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-[#281044] flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-neutral-800 mb-1">আপনার কার্ট খালি রয়েছে</h4>
              <p className="text-xs text-neutral-500 max-w-xs mb-6">
                পছন্দের কসমেটিকস অথবা স্কিনকেয়ার প্রোডাক্ট বেছে নিয়ে কার্টে যোগ করুন।
              </p>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  navigateTo('products');
                }}
                className="bg-[#281044] hover:bg-[#3b1763] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xs transition-colors"
              >
                প্রোডাক্ট ব্রাউজ করুন
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80"
              >
                {/* Product Thumb */}
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-16 h-16 object-cover rounded-lg bg-white border border-neutral-200 shrink-0"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-neutral-900 truncate">
                    {item.product.title}
                  </h4>
                  <span className="text-[11px] text-purple-900 font-bold block mb-1">
                    ৳{item.product.price.toLocaleString()}
                  </span>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center border border-neutral-300 rounded-md bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-bold text-neutral-700 ml-auto">
                      ৳{(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors shrink-0"
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>সাব টোটাল (Subtotal)</span>
                <span className="font-semibold text-neutral-900">৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>ডেলিভারি চার্জ (Delivery Fee)</span>
                <span className="text-purple-900 font-medium">চেকআউটে নির্ধারিত হবে</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#281044] pt-2 border-t border-neutral-200">
                <span>সর্বমোট (Estimated Total)</span>
                <span>৳{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#281044] hover:bg-[#3b1763] text-white font-bold text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
            >
              <span>চেকআউট ও অর্ডার কনফার্ম</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>১০০% আসল প্রোডাক্ট ও নিরাপদ ট্রানজেকশন</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
