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
        <h1 className="text-2xl font-extrabold text-[#281044]">কাস্টমার কেয়ার & হেল্পলাইন</h1>
        <p className="text-xs text-neutral-600">
          RakoMart এ আমরা আপনাকে সেরা কসমেটিকস কেনাকাটার অভিজ্ঞতা দিতে প্রতিশ্রুতিবদ্ধ। যেকোনো সহায়তায় আমাদের সাথে যোগাযোগ করুন।
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
              <h3 className="font-extrabold text-base text-emerald-950">হোয়াটসঅ্যাপ হেল্পলাইন</h3>
              <p className="text-xs text-emerald-700">সরাসরি কথা বলুন কাস্টমার সাপোর্ট টিমের সাথে</p>
            </div>
          </div>

          <p className="text-xs text-emerald-900 leading-relaxed">
            অর্ডার সংক্রান্ত সমস্যা, প্রোডাক্ট ব্যবহারের নিয়ম বা পেমেন্ট ভেরিফিকেশনে সহায়তার জন্য নিচে ক্লিক করে সরাসরি মেসেজ পাঠান।
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99]"
          >
            <span>হোয়াটসঅ্যাপে চ্যাট করুন ({settings.customerCarePhone})</span>
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
              <h3 className="font-extrabold text-base text-blue-950">অফিসিয়াল ফেইসবুক পেজ</h3>
              <p className="text-xs text-blue-700">RakoMart Official Facebook Page</p>
            </div>
          </div>

          <p className="text-xs text-blue-900 leading-relaxed">
            নতুন প্রোডাক্টের আপডেট, অফার এবং কাস্টমার রিভিউ দেখতে আমাদের অফিশিয়াল ফেইসবুক পেজে যুক্ত থাকুন।
          </p>

          <a
            href="https://www.facebook.com/share/198QLN5TSt/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99]"
          >
            <span>ফেইসবুক পেজ ভিজিট করুন</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-[#281044] border-b pb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-700" />
          <span>সাধারণ জিজ্ঞাসাসমূহ (FAQ)</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h4 className="font-bold text-neutral-900 mb-1">প্রোডাক্টগুলো কি ১০০% অরিজিনাল?</h4>
            <p className="text-neutral-600">
              হ্যাঁ, RakoMart এ প্রদর্শিত প্রতিটি কসমেটিকস ও স্কিনকেয়ার প্রোডাক্ট ১০০% আসল ও প্রামাণিক। আমরা সরাসরি অনুমোদিত ডিস্ট্রিবিউটরদের থেকে পণ্য সংগ্রহ করি।
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h4 className="font-bold text-neutral-900 mb-1">ডেলিভারি চার্জ কত এবং কতদিন সময় লাগে?</h4>
            <p className="text-neutral-600">
              ঢাকার ভেতরে ডেলিভারি ফি ৳{settings.deliveryInsideDhaka} (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ৳{settings.deliveryOutsideDhaka} (২-৩ কার্যদিবস)।
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h4 className="font-bold text-neutral-900 mb-1">পেমেন্ট মেথড কীভাবে কাজ করে?</h4>
            <p className="text-neutral-600">
              আপনি বিকাশ (bKash), নগদ (Nagad) এর মাধ্যমে অগ্রিম পেমেন্ট অথবা ক্যাশ অন ডেলিভারি (Cash on Delivery) নির্বাচন করতে পারেন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
