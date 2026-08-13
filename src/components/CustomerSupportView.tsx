import React from 'react';
import { Phone, Mail, Clock, ShieldCheck, HeartHandshake, Facebook, HelpCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CustomerSupportView: React.FC = () => {
  const { settings, navigateTo } = useStore();

  const whatsappPhone = settings.customerCarePhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappPhone}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="w-12 h-12 bg-purple-100 text-[#281044] rounded-full flex items-center justify-center mx-auto mb-2">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#281044]">Customer Care & Support</h1>
        <p className="text-xs text-neutral-600">
          At RakoMart, we are committed to providing you with the best cosmetics shopping experience. Contact us for any assistance.
        </p>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp Direct Chat Card */}
        <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-950">WhatsApp Helpline</h3>
              <p className="text-xs text-emerald-700">Direct contact with our customer support team</p>
            </div>
          </div>

          <p className="text-xs text-emerald-900 leading-relaxed">
            For order inquiries, product usage guidelines, or payment verification assistance, click below to message us directly on WhatsApp.
          </p>

          <a
            href="https://wa.me/8801756425948"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99]"
          >
            <span>Chat on WhatsApp (01756425948)</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Facebook Page Support Card */}
        <div className="bg-blue-50/80 rounded-2xl border border-blue-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Facebook className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-blue-950">Official Facebook Page</h3>
              <p className="text-xs text-blue-700">RakoMart Official Facebook Page</p>
            </div>
          </div>

          <p className="text-xs text-blue-900 leading-relaxed">
            Join our official Facebook community for new arrivals, exclusive offers, and verified customer reviews.
          </p>

          <a
            href="https://www.facebook.com/share/1BhVJTWSjz/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99]"
          >
            <span>Visit Facebook Page →</span>
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-[#281044] border-b pb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-700" />
          <span>Frequently Asked Questions (FAQ)</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h4 className="font-bold text-neutral-900 mb-1">Are your products 100% authentic?</h4>
            <p className="text-neutral-600">
              Yes, every product at RakoMart is 100% genuine and authentic. To ensure top-tier quality, we source products directly from authorized distributors and verified suppliers.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h4 className="font-bold text-neutral-900 mb-1">What is the delivery charge and how long does it take?</h4>
            <p className="text-neutral-600">
              Delivery fee inside Dhaka is ৳{settings.deliveryInsideDhaka} (24-48 hours) and outside Dhaka is ৳{settings.deliveryOutsideDhaka} (2-3 business days).
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h4 className="font-bold text-neutral-900 mb-1">How do payment methods work?</h4>
            <p className="text-neutral-600">
              You can select advance payment via bKash or Nagad, or opt for Cash on Delivery (COD).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
