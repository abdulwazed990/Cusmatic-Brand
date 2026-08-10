import React from 'react';
import { ArrowRight, ShieldCheck, Truck, Sparkles, HeartHandshake, Star, Award, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/mockProducts';
import { HeroSlider } from './HeroSlider';
import { ProductCard } from './ProductCard';

export const HomeView: React.FC = () => {
  const { products, setSelectedCategory, navigateTo, settings } = useStore();

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const bestSellers = products.slice(0, 4);

  const whatsappPhone = settings.customerCarePhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${whatsappPhone}`;

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Carousel Banner Slider */}
      <HeroSlider />

      {/* Brand Value & Statement Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-purple-900 via-[#281044] to-purple-950 text-white rounded-2xl p-6 sm:p-10 shadow-md border border-purple-800/50 relative overflow-hidden">
          <div className="max-w-3xl space-y-3 relative z-10">
            <span className="inline-block bg-purple-500/30 border border-purple-300/30 text-purple-200 text-xs font-semibold px-3.5 py-1 rounded-full">
              RakoMart Brand Statement
            </span>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug font-sans">
              “At RakoMart, we don't just sell products; we curate better choices for your lifestyle.”
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-sans">
              Whether it's daily necessities or lifestyle essentials, our commitment is simple: delivering superior quality, authentic products, and a seamless shopping experience.
            </p>
            <div className="pt-2">
              <span className="inline-block bg-white text-[#281044] text-xs font-extrabold px-4 py-2 rounded-xl shadow-xs font-bengali">
                “Don't just shop — choose better, choose রকমর্ট”
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#281044]">
              প্রোডাক্ট ক্যাটাগরিসমূহ (Categories)
            </h2>
            <p className="text-xs text-neutral-500">আপনার পছন্দের কসমেটিকস ক্যাটাগরি বেছে নিন</p>
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null);
              navigateTo('products');
            }}
            className="text-xs font-bold text-[#281044] hover:underline flex items-center gap-1"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                navigateTo('products');
              }}
              className="group bg-white rounded-xl border border-neutral-200/80 p-3 text-center cursor-pointer hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 bg-purple-50 group-hover:scale-105 transition-transform duration-300">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 group-hover:text-[#281044] transition-colors leading-snug">
                {cat.name}
              </h3>
              <span className="text-[10px] text-purple-900 font-medium font-bengali">
                {cat.nameBn}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Premium Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-0.5">
              RakoMart Featured Selection
            </span>
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#281044]">
              Where Variety Meets Uncompromised Quality.
            </h2>
          </div>

          <button
            onClick={() => {
              setSelectedCategory(null);
              navigateTo('products');
            }}
            className="text-xs font-bold text-[#281044] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>সকল প্রোডাক্ট</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Support WhatsApp Quick Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Phone className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-emerald-950">
                অর্ডার করতে সমস্যা হচ্ছে? কাস্টমার কেয়ারের সাথে কথা বলুন
              </h3>
              <p className="text-xs text-emerald-800">
                যে কোনো প্রোডাক্টের বিস্তারিত বা পেমেন্ট সহায়তায় সরাসরি মেসেজ পাঠাতে ক্লিক করুন।
              </p>
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-full shadow-xs transition-transform active:scale-95 shrink-0 text-center"
          >
            হোয়াটসঅ্যাপে চ্যাট করুন
          </a>
        </div>
      </section>

      {/* Bestsellers Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#281044]">
              জনপ্রিয় কসমেটিকস (Bestsellers)
            </h2>
            <p className="text-xs text-neutral-500">গ্রাহকদের সবচেয়ে পছন্দের ত্বকচর্চা ও রূপচর্চা পণ্যসমূহ</p>
          </div>

          <button
            onClick={() => navigateTo('products')}
            className="text-xs font-bold text-[#281044] hover:underline flex items-center gap-1"
          >
            <span>সবগুলো দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Guarantee & Trust Badges Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#281044] flex items-center justify-center mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">১০০% আসল প্রোডাক্ট</h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              আমরা কোনো প্রকার কপি বা নকল প্রোডাক্ট বিক্রি করি না। শতভাগ অরিজিনাল কসমেটিকস গ্যারান্টি।
            </p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#281044] flex items-center justify-center mb-1">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">দ্রুত সারাদেশে ডেলিভারি</h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              ঢাকার ভেতরে ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৩ দিনের মধ্যে বিশ্বস্ত কুরিয়ারে ক্যাশ অন ডেলিভারি।
            </p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-[#281044] flex items-center justify-center mb-1">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">বিকাশ ও নগদ পেমেন্ট</h4>
            <p className="text-xs text-neutral-500 max-w-xs">
              বিকাশ ও নগদের মাধ্যমে নিরাপদ অনলাইন পেমেন্ট অথবা প্রোডাক্ট বুঝে পেয়ে টাকা পরিশোধ করার সুবিধা।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
