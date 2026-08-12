import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getAllDistricts, getUpazilasForDistrict } from '../data/bangladeshData';
import { DeliveryArea, PaymentMethod } from '../types';
import { PaymentGateway } from './PaymentGateway';

export const CheckoutView: React.FC = () => {
  const { cart, cartTotal, createOrder, navigateTo, settings } = useStore();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('inside_dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('Dhanmondi');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transactionId, setTransactionId] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const districtsList = getAllDistricts();
  const upazilasList = getUpazilasForDistrict(district);

  // Update district defaults when area changes
  useEffect(() => {
    if (deliveryArea === 'inside_dhaka') {
      setDistrict('Dhaka');
    } else if (district === 'Dhaka') {
      setDistrict('Chittagong');
    }
  }, [deliveryArea]);

  // Update upazila options when district changes
  useEffect(() => {
    const available = getUpazilasForDistrict(district);
    if (available.length > 0 && !available.includes(upazila)) {
      setUpazila(available[0]);
    }
  }, [district]);

  // Delivery Fee
  const deliveryFee =
    deliveryArea === 'inside_dhaka'
      ? settings.deliveryInsideDhaka
      : settings.deliveryOutsideDhaka;

  const orderTotal = cartTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h3 className="text-xl font-bold text-neutral-800 mb-2">No products in your cart to order</h3>
        <p className="text-xs text-neutral-500 mb-6">Please browse and select your favorite cosmetics.</p>
        <button
          onClick={() => navigateTo('products')}
          className="bg-[#281044] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xs"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errors.name = 'Customer name is required.';
    }

    const cleanMobile = customerMobile.trim().replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 11) {
      errors.mobile = 'Please enter a valid 11-digit mobile number (e.g. 01700000000).';
    }

    if (!address.trim() || address.trim().length < 5) {
      errors.address = 'Please enter your complete delivery address.';
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !transactionId.trim()) {
      errors.transactionId = 'Payment Transaction ID is required for digital wallet payments.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const created = createOrder({
        customerName,
        customerEmail,
        customerMobile,
        deliveryArea,
        district,
        upazila,
        address,
        items: cart,
        subtotal: cartTotal,
        deliveryFee,
        total: orderTotal,
        paymentMethod,
        paymentAmount: orderTotal,
        transactionId: paymentMethod !== 'cod' ? transactionId : undefined,
        notes,
      });

      setIsSubmitting(false);
      navigateTo('order_confirmation', { product: undefined });
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigateTo('products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#281044] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>
      </div>

      <div className="text-center max-w-xl mx-auto space-y-1">
        <h1 className="text-2xl font-extrabold text-[#281044]">Order & Delivery Confirmation</h1>
        <p className="text-xs text-neutral-600">
          Please enter accurate contact and delivery details to complete your order.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#281044] border-b border-neutral-100 pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#281044] text-white text-xs flex items-center justify-center font-bold">1</span>
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-800">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]"
                />
                {formErrors.name && <p className="text-xs text-red-600">{formErrors.name}</p>}
              </div>

              {/* Mobile */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-800">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]"
                />
                {formErrors.mobile && <p className="text-xs text-red-600">{formErrors.mobile}</p>}
              </div>

              {/* Email Optional */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-neutral-800">
                  Email Address <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]"
                />
              </div>
            </div>
          </div>

          {/* Delivery Location Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#281044] border-b border-neutral-100 pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#281044] text-white text-xs flex items-center justify-center font-bold">2</span>
              Delivery Address
            </h3>

            {/* Delivery Area Options */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800">Select Delivery Area</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    deliveryArea === 'inside_dhaka'
                      ? 'border-[#281044] bg-purple-50/80 font-bold text-[#281044]'
                      : 'border-neutral-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'inside_dhaka'}
                    onChange={() => setDeliveryArea('inside_dhaka')}
                    className="accent-[#281044]"
                  />
                  <div>
                    <span className="text-xs block">Inside Dhaka</span>
                    <span className="text-[11px] text-purple-900 font-extrabold">Fee: ৳{settings.deliveryInsideDhaka}</span>
                  </div>
                </label>

                <label
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    deliveryArea === 'outside_dhaka'
                      ? 'border-[#281044] bg-purple-50/80 font-bold text-[#281044]'
                      : 'border-neutral-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryArea"
                    checked={deliveryArea === 'outside_dhaka'}
                    onChange={() => setDeliveryArea('outside_dhaka')}
                    className="accent-[#281044]"
                  />
                  <div>
                    <span className="text-xs block">Outside Dhaka</span>
                    <span className="text-[11px] text-purple-900 font-extrabold">Fee: ৳{settings.deliveryOutsideDhaka}</span>
                  </div>
                </label>
              </div>
            </div>

            {/* District & Upazila Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-800">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#281044]"
                >
                  {districtsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-800">Upazila / Thana</label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#281044]"
                >
                  {upazilasList.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Address */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                Detailed Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/Building No., Road No., Area Name..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#281044]"
              />
              {formErrors.address && <p className="text-xs text-red-600">{formErrors.address}</p>}
            </div>

            {/* Special Instructions / Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-neutral-800">
                Delivery Notes <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please call before arrival"
                className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#281044]"
              />
            </div>
          </div>

          {/* Payment Gateway Component Integration */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#281044] border-b border-neutral-100 pb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#281044] text-white text-xs flex items-center justify-center font-bold">3</span>
              Payment Method
            </h3>

            <PaymentGateway
              amount={orderTotal}
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
              transactionId={transactionId}
              onTransactionIdChange={setTransactionId}
              errorMsg={formErrors.transactionId}
            />
          </div>
        </div>

        {/* Right Column: Order Summary Card & Submit Action */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-md sticky top-20 space-y-5">
            <h3 className="text-base font-extrabold text-[#281044] border-b border-neutral-100 pb-3">
              Order Summary
            </h3>

            {/* Item List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900 truncate">{item.product.title}</h4>
                    <span className="text-neutral-500">
                      ৳{item.product.price.toLocaleString()} x {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-neutral-900">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">৳{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Fee ({deliveryArea === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-semibold text-neutral-900">৳{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#281044] pt-2 border-t border-neutral-200">
                <span>Total Payable</span>
                <span>৳{orderTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#281044] hover:bg-[#3b1763] text-white font-extrabold text-base py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Place Order (৳{orderTotal.toLocaleString()})</span>
                </>
              )}
            </button>

            <div className="space-y-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% genuine & authentic cosmetics guarantee.</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Easy order tracking using your mobile number.</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
