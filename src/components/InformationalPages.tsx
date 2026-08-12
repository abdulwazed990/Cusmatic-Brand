import React from 'react';
import { ArrowLeft, ShieldCheck, Truck, BookOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const InformationalPages: React.FC = () => {
  const { activeInfoPage, navigateTo, settings } = useStore();

  const getTitle = () => {
    switch (activeInfoPage) {
      case 'about':
        return 'আমাদের সম্পর্কে (About Us)';
      case 'delivery':
        return 'ডেলিভারি ও শিপিং নীতিমালা';
      case 'privacy':
        return 'প্রাইভেসি পলিসি (Privacy Policy)';
      case 'terms':
        return 'টার্মস ও কন্ডিশনস (Terms of Service)';
      default:
        return 'তথ্য ও নির্দেশিকা';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <button
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#281044] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>হোমপেজে ফিরে যান</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#281044] border-b pb-3">
          {getTitle()}
        </h1>

        {activeInfoPage === 'about' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <p className="font-semibold text-[#281044] text-base">
              “At RakoMart, we don't just sell products; we curate better choices for your lifestyle. Whether it's daily necessities or lifestyle essentials, our commitment is simple: delivering superior quality, authentic products, and a seamless shopping experience.”
            </p>

            <p>
              RakoMart is Bangladesh's trusted cosmetics and lifestyle e-commerce platform. We deliver 100% authentic skincare, hair care, makeup, and daily lifestyle essentials nationwide.
            </p>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 font-bold text-[#281044]">
              “Don't just shop — choose better, choose RakoMart”
            </div>
          </div>
        )}

        {activeInfoPage === 'delivery' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <h3 className="font-bold text-sm text-[#281044]">ডেলিভারি চার্জ ও সময়সীমা:</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>ঢাকার ভেতরে:</strong> চার্জ ৳{settings.deliveryInsideDhaka} (ডেলিভারি সময় ২৪ থেকে ৪৮ ঘণ্টা)।
              </li>
              <li>
                <strong>ঢাকার বাইরে:</strong> চার্জ ৳{settings.deliveryOutsideDhaka} (ডেলিভারি সময় ২ থেকে ৩ কার্যদিবস)।
              </li>
            </ul>
            <p>
              সকল অর্ডার কুরিয়ার সার্ভিস অথবা নিজস্ব হোম ডেলিভারি টিমের মাধ্যমে সরাসরি গ্রাহকের ঠিকানায় পৌঁছে দেওয়া হয়।
            </p>
          </div>
        )}

        {(activeInfoPage === 'privacy' || activeInfoPage === 'terms') && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <p>
              RakoMart গ্রাহকের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা প্রদান করে। আপনার নাম, মোবাইল নম্বর এবং ঠিকানা কেবল অর্ডার ডেলিভারির কাজের জন্য ব্যবহৃত হয় এবং তা অন্য কোনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
